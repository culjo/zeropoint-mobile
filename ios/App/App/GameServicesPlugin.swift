import Capacitor
import GameKit

// Game Center bridge: sign-in, leaderboard submit and the leaderboard sheet.
// JS side: www/gameServices.js (same plugin name as the Android Play Games plugin).
@objc(GameServicesPlugin)
public class GameServicesPlugin: CAPPlugin, CAPBridgedPlugin, GKGameCenterControllerDelegate {
    public let identifier = "GameServicesPlugin"
    public let jsName = "GameServices"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboard", returnType: CAPPluginReturnPromise)
    ]

    // GameKit runs the auth handler once per state change, so calls that arrive
    // while it's still deciding wait here; later calls get the settled answer
    private var authStarted = false
    private var authSettled = false
    private var pendingSignIns: [CAPPluginCall] = []

    @objc func signIn(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if GKLocalPlayer.local.isAuthenticated || self.authSettled {
                call.resolve(["signedIn": GKLocalPlayer.local.isAuthenticated])
                return
            }
            self.pendingSignIns.append(call)
            if self.authStarted { return }
            self.authStarted = true
            GKLocalPlayer.local.authenticateHandler = { [weak self] viewController, _ in
                guard let self = self else { return }
                if let viewController = viewController {
                    // Apple's sign-in sheet; the handler runs again once it closes
                    self.bridge?.viewController?.present(viewController, animated: true)
                    return
                }
                self.authSettled = true
                let signedIn = GKLocalPlayer.local.isAuthenticated
                let calls = self.pendingSignIns
                self.pendingSignIns = []
                calls.forEach { $0.resolve(["signedIn": signedIn]) }
            }
        }
    }

    @objc func submitScore(_ call: CAPPluginCall) {
        guard let leaderboardId = call.getString("leaderboardId"), let score = call.getInt("score") else {
            call.reject("leaderboardId and score are required")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not signed in to Game Center")
            return
        }
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [leaderboardId]) { error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        }
    }

    @objc func showLeaderboard(_ call: CAPPluginCall) {
        guard let leaderboardId = call.getString("leaderboardId") else {
            call.reject("leaderboardId is required")
            return
        }
        DispatchQueue.main.async {
            guard GKLocalPlayer.local.isAuthenticated else {
                call.reject("Not signed in to Game Center")
                return
            }
            let sheet = GKGameCenterViewController(leaderboardID: leaderboardId, playerScope: .global, timeScope: .allTime)
            sheet.gameCenterDelegate = self
            self.bridge?.viewController?.present(sheet, animated: true)
            call.resolve()
        }
    }

    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}

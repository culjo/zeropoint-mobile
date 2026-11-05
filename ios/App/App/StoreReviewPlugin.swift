import Capacitor
import StoreKit
import UIKit

// App Store rating: the system review prompt, and the store page for a Settings link.
// JS side: www/storeReview.js (same plugin name as the Android Play review plugin).
@objc(StoreReviewPlugin)
public class StoreReviewPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreReviewPlugin"
    public let jsName = "StoreReview"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestReview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openStorePage", returnType: CAPPluginReturnPromise)
    ]

    // iOS decides whether the prompt actually shows (at most 3 times a year per player)
    @objc func requestReview(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let scene = self.bridge?.viewController?.view.window?.windowScene else {
                call.reject("No active window")
                return
            }
            if #available(iOS 16.0, *) {
                AppStore.requestReview(in: scene)
            } else {
                SKStoreReviewController.requestReview(in: scene)
            }
            call.resolve()
        }
    }

    // Opens the App Store's write-a-review page
    @objc func openStorePage(_ call: CAPPluginCall) {
        guard let appStoreId = call.getString("appStoreId"),
              let url = URL(string: "https://apps.apple.com/app/id\(appStoreId)?action=write-review") else {
            call.reject("appStoreId is required")
            return
        }
        DispatchQueue.main.async {
            UIApplication.shared.open(url)
            call.resolve()
        }
    }
}

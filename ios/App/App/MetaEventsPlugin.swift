import AppTrackingTransparency
import Capacitor
import FBSDKCoreKit
import UIKit

// Meta (Facebook) SDK app events, for install and event attribution of Meta ads.
// The SDK itself starts in AppDelegate; installs and app opens are logged automatically.
// JS side: www/analytics.js (same plugin name as the Android plugin).
// The App ID and Client Token live in Info.plist (FacebookAppID, FacebookClientToken).
@objc(MetaEventsPlugin)
public class MetaEventsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MetaEventsPlugin"
    public let jsName = "MetaEvents"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logEvent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setEnabled", returnType: CAPPluginReturnPromise)
    ]

    private static var enabled = true

    // False while Info.plist still holds a REPLACE_ME placeholder, so the SDK stays off
    static var isConfigured: Bool {
        guard let appId = Bundle.main.object(forInfoDictionaryKey: "FacebookAppID") as? String,
              let token = Bundle.main.object(forInfoDictionaryKey: "FacebookClientToken") as? String else { return false }
        return !appId.isEmpty && appId.allSatisfy(\.isNumber) && !token.isEmpty && token != "REPLACE_ME"
    }

    // The App Tracking Transparency prompt (once per install; later calls return the saved answer).
    // The SDK reads the answer itself and only sends the advertising ID when it is "authorized".
    @objc func requestTracking(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            ATTrackingManager.requestTrackingAuthorization { status in
                let names: [ATTrackingManager.AuthorizationStatus: String] = [
                    .authorized: "authorized", .denied: "denied",
                    .restricted: "restricted", .notDetermined: "notDetermined"
                ]
                call.resolve(["status": names[status] ?? "unknown"])
            }
        }
    }

    // name: a Meta standard event (fb_mobile_…) or a custom one · params: strings and numbers
    @objc func logEvent(_ call: CAPPluginCall) {
        guard MetaEventsPlugin.isConfigured, MetaEventsPlugin.enabled else { return call.resolve() }
        guard let name = call.getString("name"), !name.isEmpty else { return call.reject("name is required") }
        var params: [AppEvents.ParameterName: Any] = [:]
        var valueToSum: Double?
        for (key, value) in call.getObject("params") ?? [:] {
            if key == "_valueToSum", let n = value as? NSNumber { valueToSum = n.doubleValue }
            else if let s = value as? String { params[AppEvents.ParameterName(key)] = s }
            else if let n = value as? NSNumber { params[AppEvents.ParameterName(key)] = n }
        }
        if let valueToSum = valueToSum {
            AppEvents.shared.logEvent(AppEvents.Name(name), valueToSum: valueToSum, parameters: params)
        } else {
            AppEvents.shared.logEvent(AppEvents.Name(name), parameters: params)
        }
        call.resolve()
    }

    // Debug mode turns events off so dev play stays out of the ad numbers
    @objc func setEnabled(_ call: CAPPluginCall) {
        let on = call.getBool("enabled") ?? true
        MetaEventsPlugin.enabled = on
        if MetaEventsPlugin.isConfigured {
            Settings.shared.isAutoLogAppEventsEnabled = on
        }
        call.resolve()
    }
}

import Capacitor

// Registers the app's own (local) plugins with the Capacitor bridge
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(GameServicesPlugin())
    }
}

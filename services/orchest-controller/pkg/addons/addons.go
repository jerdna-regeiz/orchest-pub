package addons

import (
	"context"
	"path"

	orchestv1alpha1 "github.com/orchest/orchest/services/orchest-controller/pkg/apis/orchest/v1alpha1"
	"k8s.io/klog/v2"
)

var (
	// list of all addons
	ArgoWorkflow   = "argo-workflow"
	DockerRegistry = "docker-registry"
)

type AddonsConfig struct {

	// The list of addons to disable
	DefaultAddons []string

	AssetDir string

	DefaultNamespace string
}

func NewDefaultAddonsConfig() AddonsConfig {
	return AddonsConfig{
		DefaultAddons: []string{},

		AssetDir: "/deploy",

		DefaultNamespace: "orchest",
	}
}

type Addon interface {
	// Installs addon if the config is changed
	Enable(ctx context.Context, namespace string, config *orchestv1alpha1.ApplicationConfig) error

	// Uninstall the addon
	Uninstall(ctx context.Context, namespace string) error
}

// AddonManager holds the map of deployers
type AddonManager struct {
	config AddonsConfig
	addons map[string]Addon
}

func NewAddonManager(config AddonsConfig) *AddonManager {

	addonManager := AddonManager{
		config: config,
		addons: make(map[string]Addon),
	}

	addonManager.AddAddon(ArgoWorkflow,
		NewHelmDeployer(ArgoWorkflow,
			path.Join(config.AssetDir, "thirdparty/argo-workflows/helm"),
			path.Join(config.AssetDir, "thirdparty/argo-workflows/orchest-values.yaml")))

	addonManager.AddAddon(DockerRegistry,
		NewHelmDeployer(DockerRegistry,
			path.Join(config.AssetDir, "thirdparty/docker-registry/helm"),
			path.Join(config.AssetDir, "thirdparty/docker-registry/orchest-values.yaml")))

	return &addonManager
}

// Run will not return until stopCh is closed. workers determines how many
// objects will be handled in parallel.
func (m *AddonManager) Run(stopCh <-chan struct{}) {

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Enable default addons
	for _, addonName := range m.config.DefaultAddons {
		m.EnableAddon(ctx, addonName, m.config.DefaultNamespace)
	}

	<-stopCh

}

// add an addon, if not already registred with the manager
func (m *AddonManager) AddAddon(name string, addon Addon) {

	// If already registred, log warning and return
	if _, ok := m.addons[name]; ok {
		klog.Warningf("addon %s is already registred with addon manager", name)
	}

	m.addons[name] = addon
	klog.V(2).Info("addon is registred with addon manager")
}

// Enable an addon
func (m *AddonManager) EnableAddon(ctx context.Context, addonName, namespace string) {

	funcCtx, cancel := context.WithCancel(ctx)

	go func(ctx context.Context, cancel context.CancelFunc) {
		if addon, ok := m.addons[addonName]; ok {
			// addon is registered with the addon manager
			err := addon.Enable(ctx, namespace, nil)
			if err != nil {
				klog.Errorf("failed to deploy addon: %s, err: %s", addonName, err)
				cancel()
			} else {
				klog.Infof("addon is enabled %s", addonName)
				defer addon.Uninstall(ctx, namespace)
			}
		} else {
			klog.Errorf("addon is not enabled with the addon manager addon: %s", addonName)
		}

		<-ctx.Done()

	}(funcCtx, cancel)
}

// get a deployer by the name
func (m *AddonManager) Get(name string) Addon {
	return m.addons[name]
}

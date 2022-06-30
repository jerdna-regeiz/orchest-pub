.. _installation:

Installation
============

.. note::
   Orchest is in beta.

We provide three installation paths, installation through:

* our Python based CLI `orchest-cli <https://pypi.org/project/orchest-cli/>`_, or
* `kubectl <https://kubernetes.io/docs/tasks/tools/#kubectl>`_, or
* `our Cloud offering <https://cloud.orchest.io/signup>`_ which comes with a free, fully configured
  Orchest instance.

Prerequisites
-------------

To use Orchest you will need a `Kubernetes (k8s) cluster <https://kubernetes.io/docs/setup/>`_. Any
cluster should work. You can either pick a managed service by one of the certified `cloud platforms
<https://kubernetes.io/docs/setup/production-environment/turnkey-solutions/>`_ or create a cluster
locally, e.g. using `minikube
<https://kubernetes.io/docs/tutorials/kubernetes-basics/create-cluster/cluster-intro/>`_.

Do make sure that, no matter the cluster you choose, the ingress controller is configured.

The supported operating systems are:

- Linux (``x86_64``)
- `Windows Subsystem for Linux 2 <https://docs.microsoft.com/en-us/windows/wsl/about>`_ (WSL2)
- macOS (M1 Macs should use `Rosetta <https://support.apple.com/en-us/HT211861>`_ for emulation)

.. note::
   💡 We recommend to install Orchest on a clean cluster to prevent it clashing with existing
   cluster-level resources.

Setting up a ``minikube`` cluster
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
If you already have a Kubernetes cluster to install Orchest on, then continue with :ref:`installing
Orchest <regular installation>`. In case you don't have a cluster yet, then `installing minikube
<https://minikube.sigs.k8s.io/docs/start/>`_ is a good solution in order to try out Orchest.

.. tip::
   👉 We provide an automated convenience script for a complete minikube deployment. Taking care of
   installing ``minikube``, installing the ``orchest-cli`` and installing Orchest, run it with:

   .. code-block:: bash

      curl -fsSL https://get.orchest.io > convenience_install.sh
      bash convenience_install.sh

After installing minikube, create a minikube cluster and continue with :ref:`installing Orchest
<regular installation>`.

.. code-block:: bash

   # Create a minikube cluster and configure ingress.
   minikube start --cpus 4 --addons ingress

Installing ``minikube`` and Orchest on Windows
""""""""""""""""""""""""""""""""""""""""""""""

For Orchest to work on Windows, Docker has to be configured to use WSL 2 (`Docker Desktop WSL 2
backend <https://docs.docker.com/desktop/windows/wsl/>`_).

For all further steps make sure to run CLI commands inside a WSL terminal. You can do this by
opening the distribution using the Start menu or by `setting up the Windows Terminal
<https://docs.microsoft.com/en-us/windows/wsl/setup/environment#set-up-windows-terminal>`_.

.. _regular installation:

Install ``orchest`` via ``orchest-cli``
---------------------------------------

.. code-block:: bash

   pip install --upgrade orchest-cli
   orchest install

Now the cluster can be reached on the IP returned by:

.. code-block:: bash

   minikube ip

.. tip::
   🎉 Now that you have installed Orchest, be sure to check out the :ref:`quickstart tutorial
   <quickstart>`.

Installing using an FQDN
~~~~~~~~~~~~~~~~~~~~~~~~
If you would rather reach Orchest using a Fully Qualified Domain Name (FQDN) instead of using the
cluster's IP directly, you can install Orchest using:

.. code-block:: bash

   orchest install --fqdn="localorchest.io"

.. or, if you have already installed Orchest but would like to set up an FQDN

Next, make Orchest reachable locally through the FQDN:

.. code-block:: bash

   # Set up the default Fully Qualified Domain Name (FQDN) in your
   # /etc/hosts so that you can reach Orchest locally.
   echo "$(minikube ip)\tlocalorchest.io" >> /etc/hosts

Installing without Argo Workflows
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
If you already have `Argo Workflows <https://argoproj.github.io/argo-workflows/>`_ installed on your
Kubernetes cluster, then you need to explicitly tell Orchest not to install it again:

.. code-block:: bash

    orchest install --no-argo

Since Argo Workflows creates cluster level resources, installing it again would lead to clashes or
both Argo Workflow deployments managing Custom Resource Objects (most likely you don't want either
of those things to happen).

Now that you are using an Argo Workflows set-up that is not managed by the Orchest Controller, you
need to make sure that the right set of permissions are configured for Orchest to work as expected.
Check out the permissions that the Orchest Controller sets for Argo `here
<https://github.com/orchest/orchest/tree/v2022.06.5/services/orchest-controller/deploy/thirdparty/argo-workflows/templates>`_.

Install ``orchest`` via ``kubectl``
-----------------------------------

.. tip::
   We recommend using the ``orchest-cli`` for installing and managing your Orchest Clusters
   (:ref:`link <regular installation>`).

The code snippet below will install Orchest in the ``orchest`` namespace. In case you want to
install in another namespace you can use tools like `yq <https://github.com/mikefarah/yq>`_ to
change the specified namespace in ``orchest-controller.yaml`` and ``example-orchestcluster.yaml``.

.. code-block:: bash

   # Get the latest available Orchest version
   export VERSION=$(curl \
      "https://update-info.orchest.io/api/orchest/update-info/v3?version=None&is_cloud=False" \
      | grep -oP "v\d+\.\d+\.\d+")

   # Create the namespace to install Orchest in
   kubectl create ns orchest

   # Deploy the Orchest Operator
   kubectl apply \
     -f "https://github.com/orchest/orchest/releases/download/${VERSION}/orchest-controller.yaml"

   # Apply an OrchestCluster Custom Resource
   kubectl apply \
     -f "https://github.com/orchest/orchest/releases/download/${VERSION}/example-orchestcluster.yaml"

In case you want to configure the Orchest Cluster, you can patch the created ``OrchestCluster``.

Closing notes
-------------
Authentication is disabled by default after installation. Check out the :ref:`Orchest settings
<settings>` to learn how to enable it.

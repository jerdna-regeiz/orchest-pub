import os

# TODO: add notice that some of these values have effect on the sdk!.

# General.
TEMP_DIRECTORY_PATH = "/tmp/orchest"
TEMP_VOLUME_NAME = "tmp-orchest-{uuid}-{project_uuid}"
PROJECT_DIR = "/project-dir"

# Relative to the `userdir` path.
KERNELSPECS_PATH = ".orchest/kernels/{project_uuid}"

# Relative to the `project_dir` path.
LOGS_PATH = ".orchest/{pipeline_uuid}/logs"

WEBSERVER_LOGS = "/orchest/services/orchest-webserver/app/orchest-webserver.log"
DOCS_ROOT = "https://orchest.readthedocs.io"

# Networking
ORCHEST_API_ADDRESS = "orchest-api"

# Environments
# These environments are added when you create a new project
DEFAULT_ENVIRONMENTS = [
    {
        "name": "custom-base-kernel-py",
        "base_image": "orchestsoftware/custom-base-kernel-py", 
        "language": "python",
        "startup_script": "",
        "gpu_support": False,
        "building": False,
    },
    {
        "name": "custom-base-kernel-r",
        "base_image": "orchestsoftware/custom-base-kernel-r", 
        "language": "r",
        "startup_script": "",
        "gpu_support": False,
        "building": False,
    },
]

DEFAULT_DATASOURCES = [
    {
        "name": "_default",
        "connection_details": {"absolute_host_path": "$HOST_USER_DIR/data"},
        "source_type": "host-directory",
    }
]

# memory-server
MEMORY_SERVER_SOCK_PATH = TEMP_DIRECTORY_PATH

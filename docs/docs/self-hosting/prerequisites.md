---
sidebar_position: 1
---

# 💿 Prerequisites

Whether you have purchased a self-hosted licence, or whether you'd like to install a trial version of Retrospected locally, you will need to have the following prerequisites before doing the actual [installation](quick-start).

:::tip Docker

Only basic knowledge of the Linux command line and Docker is necessary to follow the instructions below.

:::

## Docker

In order to run Retrospected, you will need to install both [Docker](https://docs.docker.com/engine/install/#server) and [Docker Compose](https://docs.docker.com/compose/install/) on your system.

:::tip Use Linux!

Docker only runs natively on Linux (and to a certain extent in Windows via [WSL](https://docs.microsoft.com/en-us/windows/wsl/)), so a Linux installation is recommended.
If you want to test it on [Mac OS](https://docs.docker.com/desktop/mac/install/) or [Windows](https://docs.docker.com/desktop/windows/install/), you can install Docker Desktop which will install both Docker and Docker Compose.

:::

In order to install Docker on Linux (Ubuntu / Debian / Mint), please run the following commands:

```shell
sudo apt-get update
sudo apt-get install docker.io
sudo apt-get install docker-compose
```

You also might want to create a docker group to allow Docker to run without sudo:

```shell
sudo groupadd docker
sudo usermod -aG docker $USER
```

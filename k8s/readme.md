# Running a Kubernetes Cluster

## Using minikube

### Installation

- Install `kubectl` (on Mac: `brew install kubectl`)
- Install minikube: https://kubernetes.io/docs/tasks/tools/install-minikube/ (for MacOS, it's as easy as `brew install minikube`)
- Start minikube with some more resources: `minikube start --cpus=4 --memory='8g'`
- Set `kubectl` to connect to minikube: `kubectl config set-context minikube`

### Setting Secrets

Once you have a minikube cluster up and running, set the secrets:

```
kubectl create secret generic retrospected-secrets \
--from-literal=DB_PASSWORD=pass \
--from-literal=PGADMIN_USER=admin \
--from-literal=PGADMIN_PASSWORD=admin \
--from-literal=SESSION_SECRET=secret \
--from-literal=TWITTER_SECRET= \
--from-literal=GOOGLE_SECRET= \
--from-literal=GITHUB_SECRET=
```

You can (and you should) of course change these values to more secure passwords.

### Install the Ingress settings

- `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/mandatory.yaml`
- `minikube addons enable ingress`

More information here: https://kubernetes.github.io/ingress-nginx/deploy/#minikube

### Set some local DNS

The Ingress configuration requires a DNS host to function, set in `ingress-service.yaml`.

If you are deploying to some server, you can use the proper domain name (for example www.retrospected.com).

If you are working locally, you need to do this:

- Get the minikube IP: `minikube ip`
- Add an entry in `/etc/hosts` that points this IP to `retro.local` (or whatever DNS you set in ingress-service.yaml)

You can also check that the Ingress service work by doing `kubectl get ingress`.

### Check the images

In `frontend-deployment.yaml` and `backend-deployment.yaml`, you need to provide the images for Retrospected. The provided ones might be out of date, or unavailable, and you might need to build your own.

### Deploy

Deploy the cluster (if your current directory is the root of this repo):

`kubectl apply -f ./k8s`

### Monitor

You can monitor your cluster and see how it's doing by running the Kubernetes Dashboard:

`minikube dashboard`

### (Optiona) Get the tunnel working

If you are using minikube and LoadBalancer, please run `minikube tunnel` in another terminal. Otherwise, your LoadBalancer services won't give you an external IP you can hit.

This does not apply if you are using the Ingress service instead.

## Using microk8s

Microk8s is very similar to minikube, but allows creating multiple nodes on the same machine (which is great to simulate a real-world scenario).
It's also more suited for Linux (and Ubuntu especially). It doesn't use VMs on Linux.

Installation is similar to the minikube one above, except:

- Install `microk8s`: https://microk8s.io/docs/
- `kubectl` is available directly from microk8s by doing `microk8s.kubectl`, and I encourage you to create an alias as it gets tiring to type very quickly.
- Enable some services: `microk8s.enable dns ingress rbac storage dashboard`
- Create the secrets (see minikube)
- Add the ingress settings (see minikube)
- Don't forget to set the IP in /etc/hosts (no idea how to get it though...)
- `kubectl apply -f ./k8s`

## Backup / Restore

### Backup

`` kubectl exec -t postgres_pod_name_12345 -- pg_dumpall -c -U postgres > dump_`date +%d-%m-%Y"_"%H_%M\_%S`.sql ``

### Restore

`cat dump_1234.sql | kubectl exec -i postgres_pod_name_12345 -- psql -U postgres`

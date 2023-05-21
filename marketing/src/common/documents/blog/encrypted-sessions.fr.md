---
slug: 'encrypted-sessions'
lang: 'fr'
title: 'Sessions cryptées'
subtitle: 'Que sont les sessions cryptées, et pourquoi les utiliser ?'
author: 'Antoine Jaussoin'
date: '2023-03-03'
keywords: 'blog,encrypted,sessions'
cover: '/assets/blog/encrypted-sessions/card.png'
---

Pourquoi utiliser des sessions cryptées ? Parce que vous voulez garder vos données privées, et les stocker de manière à ce que même Retrospected ne puisse pas les lire.

# Démarrer une session cryptée

Sur la page d'accueil, cliquez sur "Session cryptée" (au lieu de "Créer une nouvelle session") :

![Create Encrypted Session](/assets/blog/encrypted-sessions/button.png,270x124)

# Vue d'ensemble

Vos données (contenu des posts, actions, et titre de la session) sont **cryptées** et **décryptées** **localement**, dans votre navigateur.

Seul le texte crypté est envoyé au serveur, donc le serveur ne voit jamais les données en clair.

C'est comment ça se présente dans la base de données :

![Database view](/assets/blog/encrypted-sessions/db.png,1394x214)

La clé est stockée dans l'URL, après le signe dièse (#), et n'est jamais envoyée au serveur non plus ([pourquoi](https://stackoverflow.com/questions/3664257/why-is-the-hash-part-of-the-url-not-available-on-the-server-side)).

Vous pouvez alors partager l'URL via un moyen sécurisé (email, Slack...), la stocker dans un favori etc., mais la clé de cryptage ne sera jamais envoyée à Retrospected.

# Anatomie d'une URL

<span style="color: blue">https://www.retrospected.com/game/<wbr />P2NWCVKNJ</span><wbr /><span style="color: green">#</span><span style="color: red">pZ0ipXFBn</span>

La <span style="color: blue">partie bleue</span> contient l'ID de la session, alors que la <span style="color: red">partie rouge</span>,

après le <span style="color: green">#</span>, est la clé de cryptage.

Dans l'exemple ci-dessus, seule la <span style="color: blue">partie bleue</span> de l'URL est envoyée au serveur, jamais la <span style="color: red">partie rouge</span> ([source](https://stackoverflow.com/questions/3664257/why-is-the-hash-part-of-the-url-not-available-on-the-server-side)).

# Cryptage

Votre contenu est crypté localement à l'aide d'AES, avec [crypto-js/aes](https://cryptojs.gitbook.io/docs/#ciphers).

# Décryptage

Le contenu est décrypté localement, et la clé est obtenue à partir d'une des sources suivantes :

- L'URL si l'URL contient la clé de cryptage
- Votre navigateur [local storage](https://en.wikipedia.org/wiki/Web_storage)
- Une demande de saisie de la clé depuis l'application si la clé n'est ni dans l'URL ni dans le local storage.

Pourquoi est-elle stockée dans le local storage ? Pour la commodité : si vous ouvrez une session existante à partir de la liste des sessions auxquelles vous avez participé, sur la page d'accueil, la clé ne serait pas dans l'URL car cette liste provient des serveurs de Retrospected, où les clés de cryptage ne sont pas stockées.

Quand est-elle stockée dans le local storage ? Chaque fois que vous ouvrez une session avec une clé de cryptage dans l'URL, la clé sera stockée dans le local storage pour la raison expliquée ci-dessus.

# Changer la clé de cryptage

Vous pouvez changer la clé de cryptage à tout moment en cliquant sur le bouton "Changer la clé de cryptage" dans la barre de navigation.

# Partager une session cryptée

Vous pouvez partager une session cryptée avec n'importe qui, sans risque de divulguer les données de la session.

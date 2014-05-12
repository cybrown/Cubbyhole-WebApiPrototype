Cubbyhole-WebApiPrototype
=========================

Implémentation prototype pour l'API.

## Pour installer le service:

Utiliser git pour cloner ce repository, je pense que c'est acquis...

`git clone https://github.com/cybrown/Cubbyhole-WebApiPrototype.git` (attention, ça va faire un dossier dans le repertoire actuel, ne pas hésiter à `cd` jusqu'au bon repertoire)

Très important, installer les packages locaux nécessaire:

`npm install` (à faire dans le dossier que git à créer pour le projet)

Configurer la base de données dans le fichier:

`src/conf/db.json`

Ou alors configurer la base de données pour correspondre à cette configuration, au choix (ça évite

##Pour exécuter le service:

Ensuite, lancer le service:

`node index.js` (à faire dans le dossier que git à créer pour le projet)

Il est possible de lancer le service avec grunt (pas nécessaire mais utile si on le modifie souvent):

D'abord installer grunt de manière global (si pas déjà fait):

`npm install -g grunt-cli` (peut être fait dans n'importe quel dossier)

##Pour lancer les tests:

D'abord, installer grunt de manière global:

`npm install -g grunt-cli` (peut être fait dans n'importe quel dossier)

Ensuite, Exécuter les tests avec grunt:

`grunt test` (à faire dans le dossier que git à créer pour le projet)

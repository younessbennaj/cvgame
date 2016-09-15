 var jouerAuJeu = (function() {
  var monCanvas;
  var contexte;

  /*/Variables associées à la balle/*/

  var ballePositionX = 200;
  var ballePositionY = 300;
  var balleVitesseX = 3;
  var balleVitesseY = 5;

  /*/Variables associées à la plateforme/*/

  var plateformeLargeur = 100;
  var plateformeHauteur = 10;
  var plateformePositionX = 400;
  var plateformePositionY = 60;

  /*/Variables associées aux briques/*/

  var briqueLargeur = 50;
  var briqueHauteur = 30;
  var nombreColonneBriques = 16;
  var nombreLigneBriques = 7;
  var tableauBriques = [];
  var briquesRestantes = 0;

  var sourisPositionX = 0;
  var sourisPositionY = 0;



  /*/bougerSouris() permet de connaitre les coordonnées de la souris dans l'éléments canvas grâce au gestionnaire d'évenement onmouse
  et clientX qui permet de lire les coordonnées horizontales, cette fonction est invoquée dans la fonction monJeu où l'élément canvas
  est defini/*/

  var bougerSouris = function(event) {
    var canvasPosition = $('#monCanvas').position();

    var canvasMargin = $('#monCanvas').css("margin-left");
    var competenceMargin = $('.competence-bar').css("width");
    var competencePadding = $('.competence-bar').css("padding-left");
    /*/Pour des raisons de mise en page on doit également soustraire les différentes margin et le padding/*/

    sourisPositionX = event.clientX - canvasPosition.left - parseFloat(canvasMargin) - parseFloat(competenceMargin) + parseFloat(competencePadding);
    sourisPositionY = event.clientY - canvasPosition.top;
    /*/On peut observer que les coordonnées lu dans la console ne correspondent pas avec les coordonnées exacte du canvas.
    Il y'a un décallage de 8px sur la gauche du à la position du canvas dans la fenetre. J'utilise donc la méthode .position() de jQuery pour
    récupérer cette valeur. On tranmet donc les coordonnées de la souris à la position en X de notre plateforme/*/
    plateformePositionX = sourisPositionX - (plateformeLargeur/2);

    /*/On soustrait la moitié de la largeur de la plate forme pour que le curseur de la souris se retrouve au milieu de notre plateforme/*/
    // console.log(sourisPositionX);
    


  }

  var afficherCompetence = function() {
    if(briquesRestantes == 98) {
      $('#html').css('display', 'inline-block');
    }
    if(briquesRestantes == 84) {
      $('#css').css('display', 'inline-block');
    }
    if(briquesRestantes == 70) {
      $('#javascript').css('display', 'inline-block');
    }
    if(briquesRestantes == 56) {
      $('#jquery').css('display', 'inline-block');
    }
    if(briquesRestantes == 42) {
      $('#angular').css('display', 'inline-block');
    }
    if(briquesRestantes == 28) {
      $('#mongodb').css('display', 'inline-block');
    }
    if(briquesRestantes == 14) {
      $('#node').css('display', 'inline-block');
    }
    if(briquesRestantes == 0) {
      $('#meteor').css('display', 'inline-block');
    }


  }

  /*/On invoque la fonction monJeu au chargement du document/*/
  var monJeu = function() {
    monCanvas = window.document.getElementById('monCanvas');
    contexte = monCanvas.getContext('2d');

    requestAnimationFrame(mettreAJour);
    monCanvas.addEventListener('mousemove', bougerSouris);

    placerBriques();

  }

  window.addEventListener('load', monJeu);

  /*/La fonction mettreAJour() permet de rafraichir en permanence le canvas, elle est invoquée dnas la fonction monJeu() et j'ai utilisé
  une récurssion pour pouvoir la relancer en permanence/*/

  var mettreAJour = function() {

    faireBouger();
    dessinerElements();
    requestAnimationFrame(mettreAJour);

  }


  var mouvementBalle = function() {
    /*/Permet de faire bouger la balle en incrémentant sa position/*/
    ballePositionX += balleVitesseX;
    ballePositionY += balleVitesseY;


    /*/Gère la collision entre la balle et les bords du canvas/*/
    if(ballePositionX < 0) {
      balleVitesseX *= -1;
    }
    if(ballePositionX > monCanvas.width) {
      balleVitesseX *= -1;
    }
    if(ballePositionY < 0) {
      balleVitesseY *= -1;
    }
    if(ballePositionY > monCanvas.height) {
      rejouerBalle();
    }
  }

  var collisionBallePlateforme = function() {
    /*/La balle rentre en collision avec la plateforme lorque ses coordonnées sont comprises entre celle de chaque coté de la plateforme:
    - coordonnées coté gauche de la plateforme en X < coordonnées de la balle en X < coordonnées coté droit de la plateforme en X
    - coordonnées coté haut de la plateforme en Y < coordonnées de la balle en Y < coordonnées coté bas de la plateforme en Y
    /*/

    var coteGaucheX = plateformePositionX; //Position de la plateforme en X
    var coteDroitX = coteGaucheX + plateformeLargeur; //Coordonnées en X de la plateforme + la largeur de la plateforme
    var coteHautY = monCanvas.height - plateformePositionY; //Position de la plateforme en Y
    var coteBasY = coteHautY + plateformeHauteur; //Coordonnées en Y du coté haut + la hauteur de la plateforme

    // console.log(coteGaucheX);
    // console.log(coteGaucheX);
    // console.log(coteBasY);
    // console.log(coteHautY);

    /*/donc si les coordonnées de la balle en X et en Y se retrouvent entre ces coordonnées en X et en Y alors il y'a collision et la balle
    est renvoyé dans le sens inverse selon l'axe des Y/*/

    if(ballePositionY > coteHautY && ballePositionY < coteBasY && ballePositionX > coteGaucheX && ballePositionX < coteDroitX) {

      balleVitesseY *= -1;

      /*/Une fois la balle en collision on souhaite lui donner plus ou moins d'effet selon l'endroit ou elle touche la plateforme.
      Plus elle touche la plateforme aux extrémités, plus sa vitesse en X sera élevée et donc dévié sur les cotés. Plus elle touche la plateforme vers le centre, plus la
      vitesse est faible et la balle est moins déviée./*/

      var centrePlateForme = plateformePositionX + (plateformeLargeur/2); //Coordonnée en X du centre de la plateforme
      var distanceCentreBalle = ballePositionX - centrePlateForme;
      /*/Lorsque la balle va se trouver à la droite du centre de la plate forme au moment de la collision le resulat de cette soustraction
      sera négatif et donc ça vitesse sera affecté d'un coefficient négatif (sens inverse dans l'axe de X - déplacement vers la gauche).
      Au contraire si la balle se trouve à gauche c'est l'inverse et la balle se déplace vers la droite.
      Plus la balle sera proche du centre et plus le résultat de cette soustraction sera faible et donc sa vitesse se verra attribué un
      coefficient petit et donc la balle aura un déplacement plus lent. A l'inverse plus elle est éloigné du centre au moment de la collision
      et plus cette soustraction sera élévé et sa vitesse également donc./*/
      balleVitesseX = 0.3 * distanceCentreBalle; /*/On multiplie ensuite ce coefficient par 0.3 (trouver par tatonnement) pour obtenir une vitesse qui
      nous semble idéale pour le jeu/*/
    }

    // if(briquesRestantes == 0) {
    //   console.log("You win");
    //   //Passer une condition à true qui affiche les compétences
    // }

  }

  var collisionBalleBrique = function() {
    /*/On va maintenant diviser notre canvas en plusieurs zone de même taille (généralement appellées tiles ou tuiles dans le domaine du jeu vidéo
    et c'est la méthode que j'ai tenté d'apprendre et d'utiliser pour ce jeu).
    Chaques cases aura la taille d'une brique. Chaques tiles aura des coordonnées en x et en y. Lorsque la position de la balle
    sera comprise dans la zone où se situe les briques,C'est à dire que la position de la balle en X et en Y selon l'echelle des
    tiles correspondra à celle d'une des briques, alors il y'aura collision et la brique qui se situe à ces coordonnées
    (en tile) verra sa condition passé de true à false et ne sera plus dessiner à la prochaine frame/*/

    /*/Ces deux valeur nous permettent de visualiseer les coordonées en tile de chaques cases/*/
    var tileX = briqueLargeur; //Largeur d'une tile
    var tileY = briqueHauteur; //Hauteur d'une tile
    var positionBalleTileX = Math.floor(ballePositionX / tileX);//traduit en tile les coordonnées de position en X de la balle en pixel
    var positionBalleTileY = Math.floor(ballePositionY / tileY);//traduit en tile les coordonnées de position en Y de la balle en pixel
    var positionBriqueX = [0, nombreColonneBriques -1]; //interval des X dans lequel se trouve les briques en tile
    var positionBriqueY = [0, nombreLigneBriques - 1]; //interval des Y dans lequel se trouve les briques en tile

    /*/Sachant qu'on a 16*8 brique, on veut alors vérifié si les coordonnées qui corrspondent à notre balle sont bien comprise dans cette
    zone (de [0;0] à [15;7])/*/
    if((positionBalleTileX >= 0 && positionBalleTileX < nombreColonneBriques) && (positionBalleTileY >= 0 && positionBalleTileY < nombreLigneBriques)) {
      //Si le balle est dans la zone de jeu où sont sensés se trouver les briques:
      if(tableauBriques[positionBalleTileX + positionBalleTileY * nombreColonneBriques]) {
        //Si la brique existe: (évite le 'rebond' sur les espaces vides) => Condition à true
        tableauBriques[positionBalleTileX + positionBalleTileY * nombreColonneBriques] = false; /*/Nous permet de retrouver
        l'indice correspondant à la brique dans le tableau et de passer la condition à false pour la faire disparaitre/*/
        briquesRestantes--;
        afficherCompetence();

        /*/A la collision avec une brique la vitesse selon l'axe des Y est inversé
       cependant il faut utiliser une condition qui vérifie que la brique existe (à true dans le tableauBriques) sinon la
       balle change en permanence de direction dans la zone ou se trouve les briques et "rebondie" sur les espaces vides.
       On utilise cette condition plus haut (second If)./*/

       /*/Cependant on souhaite améliorer la collision entre la balle et la brique pour avoir plus de réalisme. Si on s'en
       tien seulement à inversé la vitesse en Y, on remarque que peu importe l'endroit ou la balle touche la brique, y compris
       sur les cotés, celle ci est renvoyé de la même façon créant une expérience de jeu moins réaliste.
       Les jeux de briques classiques décompent généralement les collisions en quatre cas distinctifs:
       - La balle touche la brique sur un de ces cotés (droit ou gauche): Dans ce cas on inverse la vitesse en X de la balle
       - La balle touche la brique dessus ou en dessous: Dans ce cas on inverse la vitesse en Y de la balle
       - La balle touche la brique exactement sur son coin: On inverse la vitesse en X et en Y
       - La balle touche la brique exactement sur son coin mais il existe une autre brique qui la précedent en X ou en Y:
       La balle doit avoir le même comportement que dans les deux premiers cas

       L'objectif est donc de savoir quelle était la position de la balle juste avant la collision pour savoir dans quelle
       direction la renvoyer/*/

        var ballePositionXPrecedente = ballePositionX - balleVitesseX; //On obtient la position de la balle à la frame précédente en X (pixel)
        var ballePositionYPrecedente = ballePositionY - balleVitesseY; //On obtient la position de la balle à la frame précédente en Y (pixel)

        var positionBalleTileXPrecedente = Math.floor(ballePositionXPrecedente / tileX);//La même chose mais en Tile
        var positionBalleTileYPrecedente = Math.floor(ballePositionYPrecedente / tileY);//La même chose mais en Tile

        var aucuneConditionValidee = true;/*/On initialise une variable qui va nous permettre de savoir si une des conditions
         n'est valide/*/

        if(positionBalleTileXPrecedente != positionBalleTileX) { /*/On vérifie si la position de la balle en X est la même
          qu'a la frame précédente/*/
          var indexBriqueACote = positionBalleTileXPrecedente + positionBalleTileY * nombreColonneBriques;
          //On créer une variable qui va contenir contient l'index dans le tableauBriques de la brique précédente

          if(tableauBriques[indexBriqueACote] == false) {//Si cette brique est absente
            balleVitesseX *= -1;
            aucuneConditionValidee = false;
          }
        }

        if(positionBalleTileYPrecedente != positionBalleTileY) { /*/On vérifie si la position de la balle en Y est la même
          qu'a la frame précédente/*/
          var indexBriqueDuDessous = positionBalleTileX + positionBalleTileYPrecedente * nombreColonneBriques;
          //On créer une variable qui va contenir contient l'index dans le tableauBriques de la brique du dessous

          if(tableauBriques[indexBriqueDuDessous] == false ) {//Si cette brique est absente
            balleVitesseY *= -1;
            aucuneConditionValidee = false;
          }
        }

        if(aucuneConditionValidee) {
          balleVitesseX *= -1;
          balleVitesseY *= -1;
        }


      }

    };

  }



  var faireBouger = function() {

    mouvementBalle();

    collisionBallePlateforme();

    collisionBalleBrique();

  }

  var rejouerBalle = function() {
    ballePositionX = monCanvas.width/2;
  	ballePositionY = monCanvas.height/2;
    balleVitesseX = 3;
    balleVitesseY = 5;
  }

  var creerTableauPosition = function() {

  }

  /*/La fonction dessinerElements va permettre de dessiner dans le canvas les différents éléments de mon animation. chaques
  fonctions qui permettent de dessiner possedent des paramètre sur lesquels nous allons venir agir grâce à différentes fonctions
  créant ainsi tous les comportements de notre jeu et les différentes animations qui les illustrent./*/

  var dessinerElements = function() {
    /*/L'ordre selon lequel on dessine nos éléments dans le canvas à une importance. Les éléments placer en premier sont dessiné
    d'abord et ensuite les autres éléments sont dessiné par dessus au fur et à mesure./*/
    dessinerRectangle(0,0,monCanvas.width, monCanvas.height, 'black');
    /*/Ce premier rectangle va servir de fond à notre jeu. A chaque rafraichissement de notre canvas il va venir recouvrir ce
    qui a été dessiner à la frame précédente donnant ainsi une illusion de mouvement évitant de sauvegardéà chaque fois le contexte
    puis de le clearer/*/
    dessinerBalle(ballePositionX, ballePositionY, 10, '#1e7be2');
    /*/A chaque frame ensuite va venir se dessiner la balle par dessus en fonction des position en X et en Y que l'on aura defini selon
    des conditions/*/
    dessinerRectangle(plateformePositionX, monCanvas.height - plateformePositionY, plateformeLargeur, plateformeHauteur, 'white');
    /*/On vient après dessiner notre plate forme en fonction des position en X et en Y de la souris/*/
    dessinerBrique();
    /*/et enfin on vient appeler la fonction dessinerBrique() qui va placé notre brique/*/

    /*/Outils qui permet de visualiser les coordonnées en Tile de chaques cases avec la souris (décommenter pour utiliser)/*/
    // /*/Ces deux valeur nous permettent de visualiseer les coordonées en tile de chaques cases/*/
    // var tileX = briqueLargeur; //Largeur d'une tile
    // var tileY = briqueHauteur; //Hauteur d'une tile
    // var positionSourisTileX = Math.floor(sourisPositionX / briqueLargeur);//traduit les coordonnées en pixel en tile
    // var positionSourisTileY = Math.floor(sourisPositionY / briqueHauteur);//traduit les coordonnées en pixel en tile
    // var positionBriqueX = [0, nombreColonneBriques -1]; //interval des X dans lequel se trouve les briques
    // var positionBriqueY = [0, nombreLigneBriques - 1]; //interval des Y ddans lequel se trouve les briques
    //
    // /*/Nous allons donc vérifié si à l'endroit ou on pose notre souris il est censé y avoir une brique. Sachant qu'on a 16*8 briques
    // On veut alors vérifié si les coordonnées qui corrspondent à notre souris sont bien comprise dans cette zone (de [0;0] à [15;7])/*/
    // if((positionSourisTileX >= 0 && positionSourisTileY < 16) && (positionSourisTileY >= 0 && positionSourisTileY < 8)) {
    //   tableauBriques[positionSourisTileX + positionSourisTileY * nombreColonneBriques] = false; /*/Nous permet de retrouver
    //   l'indice correspondant à la brique dans la tableau et de passer la condition à false pour la faire disparaitre/*/
    //
    // };
    //
    // console.log(positionSourisTileX);

  }

  /*/dessinerBrique() est une fonction qui permet de dessiner les briques si une condition est verifiée. Lorsque cette condition n'est
  plus verifié alors la brique n'est plus dessinée. A chaque collision avec la balle cettte condition passe à false./*/

  var dessinerBrique = function() {
    for(var j = 0; j < nombreLigneBriques; j++) { //Premier If qui va boucler selon le nombre de ligne défini
        for(var i = 0; i < nombreColonneBriques; i++) { //Second If qui va boucler selon le nombre de colonne
           var monIndice = nombreColonneBriques * j + i; //Les briques seront donc indéxées à partir de 0 et jusqu'a nbre de brique - 1
           /*/On créer une variable monIndice qui va nous permettre rendre chaque brique bien indépedante dans le tableau. Sinon on se
           se retrouve avec plusieurs briques (sur chaque nouvelle ligne ou chaque colonne) qui possèdent le même indice (si on utilise i ou j).
           Le probème était donc que si la valeur qui se trouvait à cet indice passait à false, toute la colonne ou la ligne était supprimé et pas seulement
           la brique voulue./*/
          if(tableauBriques[monIndice]) { //Si la condition est verifié alors on dessine un rectangle dans le canvas
            dessinerRectangle(briqueLargeur*i, briqueHauteur*j,briqueLargeur - 2, briqueHauteur -2, '#1e7be2'); /*/On prend comme largeur briqueLargeur - 2
            pour créer un effet 'brique' et d'espace/*/
          }
        }
      }
    }

    /*/On peut donc jouer sur les différentes conditions true et false présentes dans le tableauBriques qui font références
    à chaques briques, definissant si elles sont dessiner ou non à la prochaine frame, pour créer des motifs de placement de
    briques différents./*/

  /*/placerBriques() est une fonction qu'on appelle à chaque début de jeu et qui permet d'initialisé toutes les valeurs du tableauBriques à true.
  Les briques sont alors toutes visibles en début de jeu./*/
  var placerBriques = function() {
    for(var i = 0; i < (nombreColonneBriques * nombreLigneBriques); i++) { //(nombreColonneBriques * nombreLigneBriques) nous donne le nombre total de briques
      tableauBriques[i] = true;

    }
    briquesRestantes = nombreLigneBriques * nombreColonneBriques;
  }

  function dessinerRectangle(positionX,positionY, largeur,hauteur, couleur) {
  	contexte.fillStyle = couleur;
  	contexte.fillRect(positionX,positionY, largeur,hauteur);
  }

  function dessinerBalle(positionX,positionY, rayon, couleur) {
  	contexte.fillStyle = couleur;
  	contexte.beginPath();
  	contexte.arc(positionX,positionY, rayon, 0,Math.PI*2, true);
  	contexte.fill();
  }

  function colorText(showWords, textX,textY, fillColor) {
  	contexte.fillStyle = fillColor;
  	contexte.fillText(showWords, textX, textY);
  }


})();

"use strict";

const ValleLocale = (() => {
  const languages = ["es", "en", "fr", "pt"];
  const preference = "valle-chispa:language";
  let language = "en";
  try {
    const saved = localStorage.getItem(preference);
    if (languages.includes(saved)) language = saved;
  } catch {}
  const forced = new URLSearchParams(location.search).get("lang");
  if (languages.includes(forced)) language = forced;
  const locale = { es: "es-ES", en: "en-GB", fr: "fr-FR", pt: "pt-PT" }[language];
  const catalog = new Map();

  function add(rows) {
    for (const row of rows.trim().split("\n")) {
      const [source, ...translations] = row.split("|").map((part) => part.trim());
      if (language !== "es") catalog.set(source, translations[languages.indexOf(language) - 1]);
    }
  }

  function t(text) {
    const original = text.trim();
    const translation = catalog.get(original);
    return translation ? text.replace(original, () => translation) : text;
  }

  function translateDocument() {
    document.documentElement.lang = language;
    const description = document.querySelector("meta[name=description]");
    description.content = t("Despierta el cristal del Claro Esmeralda en Valle Chispa.");
    if (language === "es") return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.parentElement.closest("script, style, [data-language-name]")) node.textContent = t(node.textContent);
    }
    for (const element of document.querySelectorAll("[aria-label], [title], [alt]")) {
      for (const attribute of ["aria-label", "title", "alt"]) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, t(value));
      }
    }
  }

  function setLanguage(value) {
    if (!languages.includes(value) || value === language) return;
    const url = new URL(location.href);
    try {
      localStorage.setItem(preference, value);
      url.searchParams.delete("lang");
    } catch {
      url.searchParams.set("lang", value);
    }
    location.assign(url.href);
  }

  add(`
Idioma|Language|Langue|Idioma
Elige el idioma del juego|Choose the game language|Choisissez la langue du jeu|Escolhe o idioma do jogo
Aplicar|Apply|Appliquer|Aplicar
Menú principal|Main menu|Menu principal|Menu principal
Menú|Menu|Menu|Menu
Jugar|Play|Jouer|Jogar
Continuar partida|Continue|Continuer|Continuar
Cómo jugar|How to play|Comment jouer|Como jogar
Pantalla completa|Full screen|Plein écran|Ecrã inteiro
Salir de pantalla completa|Exit full screen|Quitter le plein écran|Sair do ecrã inteiro
Empezar de nuevo|Start over|Recommencer|Recomeçar
Donaciones|Donations|Dons|Donativos
Métodos de donación|Donation methods|Modes de don|Métodos de donativo
Ko-Fi (recomendado)|Ko-Fi (recommended)|Ko-Fi (recommandé)|Ko-Fi (recomendado)
Despierta el cristal del Claro Esmeralda.|Awaken the crystal in Emerald Glade.|Réveillez le cristal de la Clairière d’émeraude.|Desperta o cristal da Clareira Esmeralda.
Continúa en|Continue in|Reprenez à|Continua em
Aprende a recoger chispas y completar el primer objetivo.|Learn to collect sparks and complete your first goal.|Apprenez à récolter des étincelles et à remplir le premier objectif.|Aprende a recolher faíscas e a completar o primeiro objetivo.
Vuelve a la ventana del navegador.|Return to the browser window.|Revenez à la fenêtre du navigateur.|Volta à janela do navegador.
Expande el valle a toda la pantalla.|Expand the valley to fill the screen.|Affichez la vallée en plein écran.|Expande o vale para preencher o ecrã.
Reinicia el valle desde el comienzo.|Restart the valley from the beginning.|Repartez du début.|Reinicia o vale desde o início.
Apoya el desarrollo de Valle Chispa.|Support the development of Valle Chispa.|Soutenez le développement de Valle Chispa.|Apoia o desenvolvimento de Valle Chispa.
Elegir|Select|Choisir|Escolher
Confirmar|Confirm|Confirmer|Confirmar
Espacio|Space|Espace|Espaço
Enter|Enter|Entrée|Enter
Tienda|Shop|Boutique|Loja
Chispas|Sparks|Étincelles|Faíscas
chispa|spark|étincelle|faísca
chispas|sparks|étincelles|faíscas
chispas.|sparks.|étincelles.|faíscas.
Volver|Back|Retour|Voltar
Volver al menú|Back to menu|Retour au menu|Voltar ao menu
Producción automática|Automatic production|Production automatique|Produção automática
Ver progreso|View progress|Voir la progression|Ver progresso
Progreso|Progress|Progression|Progresso
Mapas|Maps|Cartes|Mapas
Mapas del valle|Valley maps|Cartes de la vallée|Mapas do vale
Lista de mapas|Map list|Liste des cartes|Lista de mapas
Actividades|Activities|Activités|Atividades
Recoger una chispa del cristal|Collect a spark from the crystal|Récolter une étincelle du cristal|Recolher uma faísca do cristal
Tus compañeros|Your companions|Vos compagnons|Os teus companheiros
Púlsame|Tap me|Touchez-moi|Toca-me
+1 por pulso|+1 per tap|+1 par pression|+1 por toque
por pulso|per tap|par pression|por toque
Una chispa por pulsación.|One spark per tap.|Une étincelle par pression.|Uma faísca por toque.
chispas por pulsación.|sparks per tap.|étincelles par pression.|faíscas por toque.
Activa JavaScript para jugar.|Enable JavaScript to play.|Activez JavaScript pour jouer.|Ativa o JavaScript para jogar.
Cerrar aviso|Dismiss notification|Fermer la notification|Fechar notificação
Chispas disponibles|Available sparks|Étincelles disponibles|Faíscas disponíveis
Cerrar tienda|Close shop|Fermer la boutique|Fechar loja
Categorías de la tienda|Shop categories|Catégories de la boutique|Categorias da loja
Artículos de la tienda|Shop items|Articles de la boutique|Artigos da loja
Cerrar mapas|Close maps|Fermer les cartes|Fechar mapas
Cerrar actividades|Close activities|Fermer les activités|Fechar atividades
Tipos de actividad|Activity types|Types d’activité|Tipos de atividade
Actividad seleccionada|Selected activity|Activité sélectionnée|Atividade selecionada
Minijuego|Minigame|Mini-jeu|Minijogo
Encargos|Quests|Quêtes|Missões
Evoluciones|Evolutions|Évolutions|Evoluções
¿Borrar toda tu partida?|Delete all your progress?|Effacer toute votre partie ?|Apagar todo o teu progresso?
Cancelar|Cancel|Annuler|Cancelar
Borrar partida|Delete save|Effacer la partie|Apagar partida
Se borrará todo tu progreso guardado en este navegador: chispas, compras, compañeros, evoluciones, mapas, récords y encargos. Esta acción es irreversible.|This permanently deletes all progress saved in this browser: sparks, purchases, companions, evolutions, maps, records and quests.|Cette action efface définitivement toute la progression enregistrée dans ce navigateur : étincelles, achats, compagnons, évolutions, cartes, records et quêtes.|Esta ação apaga permanentemente todo o progresso guardado neste navegador: faíscas, compras, companheiros, evoluções, mapas, recordes e missões.
Pulsa el cristal, el botón «Púlsame» o la barra espaciadora para ganar chispas. Canjéalas en la tienda por compañeros, mejoras, gemas y efectos. Recoge 25 en total para completar Primer destello. Tu partida se guarda en este navegador.|Tap the crystal, use Tap me or press the spacebar to earn sparks. Spend them in the shop on companions, upgrades, gems and effects. Collect 25 in total to complete First Spark. This browser saves your progress.|Touchez le cristal, le bouton « Touchez-moi » ou la barre d’espace pour gagner des étincelles. Échangez-les en boutique contre des compagnons, des améliorations, des gemmes et des effets. Réunissez-en 25 pour terminer Première Étincelle. Votre navigateur enregistre la partie.|Toca no cristal, no botão «Toca-me» ou na barra de espaço para ganhar faíscas. Troca-as na loja por companheiros, melhorias, gemas e efeitos. Recolhe 25 no total para concluir Primeira Faísca. O navegador guarda a tua partida.
Las chispas acumuladas desbloquean mapas. En Actividades encontrarás minijuegos, encargos y evoluciones. Los compañeros y las mejoras pueden producir durante hasta dos horas con el juego cerrado.|Total sparks unlock maps. Find minigames, quests and evolutions under Activities. Companions and upgrades can produce sparks for up to two hours while the game is closed.|Le total d’étincelles déverrouille des cartes. Retrouvez les mini-jeux, les quêtes et les évolutions dans Activités. Les compagnons et améliorations peuvent produire pendant deux heures lorsque le jeu est fermé.|As faíscas acumuladas desbloqueiam mapas. Em Atividades encontras minijogos, missões e evoluções. Os companheiros e melhorias podem produzir durante até duas horas com o jogo fechado.
El navegador ha impedido borrar el guardado. Tu partida sigue activa.|The browser could not delete the save. Your progress is still available.|Le navigateur n’a pas pu effacer la sauvegarde. Votre partie est toujours disponible.|O navegador impediu a eliminação. A tua partida continua disponível.
Objetivo completado. Has recogido tus primeras 25 chispas.|Goal complete. You collected your first 25 sparks.|Objectif atteint. Vous avez récolté vos 25 premières étincelles.|Objetivo concluído. Recolheste as tuas primeiras 25 faíscas.
de 25 chispas recogidas.|of 25 sparks collected.|étincelles récoltées sur 25.|de 25 faíscas recolhidas.
Primer destello|First Spark|Première Étincelle|Primeira Faísca
Nuevo mapa desbloqueado|New map unlocked|Nouvelle carte déverrouillée|Novo mapa desbloqueado
Has viajado|You travelled|Vous avez voyagé|Viajaste
Guardado desactivado|Saving unavailable|Sauvegarde indisponible|Gravação indisponível
El progreso se conservará mientras esta página siga abierta.|Progress is kept while this page stays open.|La progression est conservée tant que cette page reste ouverte.|O progresso é mantido enquanto esta página estiver aberta.
El navegador ha mantenido el juego en su ventana.|The browser kept the game in its window.|Le navigateur a conservé le jeu dans sa fenêtre.|O navegador manteve o jogo na janela.
chispa disponible.|spark available.|étincelle disponible.|faísca disponível.
chispas disponibles.|sparks available.|étincelles disponibles.|faíscas disponíveis.
por segundo)|per second)|par seconde)|por segundo)
chispa por segundo.|spark per second.|étincelle par seconde.|faísca por segundo.
chispas por segundo.|sparks per second.|étincelles par seconde.|faíscas por segundo.
Recoge|Collects|Récolte|Recolhe
Nivel|Level|Niveau|Nível
de|of|sur|de
Mapa inicial|Starting map|Carte de départ|Mapa inicial
chispas acumuladas|total sparks|étincelles cumulées|faíscas acumuladas
Aquí estás|You are here|Vous êtes ici|Estás aqui
Viajar|Travel|Voyager|Viajar
Falta 1 chispa|1 spark needed|Il manque 1 étincelle|Falta 1 faísca
Faltan|Still needed:|Il manque|Faltam
Te faltan|You need|Il vous manque|Precisas de mais
chispa.|spark.|étincelle.|faísca.
Este artículo está en otra tienda.|This item is sold in another shop.|Cet article est vendu dans une autre boutique.|Este artigo está noutra loja.
Probar|Preview|Essayer|Experimentar
por|for|pour|por
chispa/s|spark/s|étincelle/s|faísca/s
chispas/s|sparks/s|étincelles/s|faíscas/s
Nivel máximo|Max level|Niveau maximum|Nível máximo
Mejorar|Upgrade|Améliorer|Melhorar
Adoptado|Adopted|Adopté|Adotado
Adoptar|Adopt|Adopter|Adotar
En uso|Equipped|Équipé|Equipado
Equipar|Equip|Équiper|Equipar
Comprar|Buy|Acheter|Comprar
al nivel|at level|au niveau|no nível
se ha unido a tu colección.|joined your collection.|a rejoint votre collection.|juntou-se à tua coleção.
en uso.|equipped.|est équipé.|equipado.
ha evolucionado y ahora reúne|evolved and now collects|a évolué et récolte maintenant|evoluiu e agora recolhe
La partida ha cambiado en otra pestaña.|The save changed in another tab.|La partie a changé dans un autre onglet.|A partida mudou noutro separador.
Completa los encargos de|Complete the quests in|Terminez les quêtes de|Completa as missões de
y cobra sus recompensas.|and claim their rewards.|et récupérez leurs récompenses.|e recebe as recompensas.
Cada pulsación y cada acierto en un minijuego dan experiencia a tus compañeros. Al evolucionar, duplican su producción.|Each tap and minigame hit gives your companions experience. Evolution doubles their production.|Chaque pression et réussite dans un mini-jeu donne de l’expérience à vos compagnons. L’évolution double leur production.|Cada toque e cada acerto num minijogo dão experiência aos teus companheiros. A evolução duplica a produção.
Adopta un compañero en la tienda o gana a Aleta en la pesca.|Adopt a companion in the shop or win Aleta by fishing.|Adoptez un compagnon en boutique ou gagnez Aleta à la pêche.|Adota um companheiro na loja ou ganha Aleta na pesca.
Progreso de|Progress for|Progression de|Progresso de
chispas por «|sparks for «|étincelles pour «|faíscas por «
Cobrado|Claimed|Récupéré|Recebido
Cobrar|Claim|Récupérer|Receber
Evolucionado|Evolved|Évolué|Evoluído
Evolucionar|Evolve|Évoluer|Evoluir
Jugar ronda|Start round|Jouer une manche|Jogar ronda
Casillas del minijuego, teclas 1 a 9|Minigame squares, keys 1 to 9|Cases du mini-jeu, touches 1 à 9|Casas do minijogo, teclas 1 a 9
Casilla|Square|Case|Casa
, iluminada|, lit|, éclairée|, iluminada
Seis intentos|Six attempts|Six essais|Seis tentativas
Pesca los cuatro peces para conseguir a Aleta.|Catch all four fish to get Aleta.|Attrapez les quatre poissons pour obtenir Aleta.|Pesca os quatro peixes para obter Aleta.
Récord:|Best:|Record :|Recorde:
chispas por acierto.|sparks per hit.|étincelles par réussite.|faíscas por acerto.
Aciertos:|Hits:|Réussites :|Acertos:
Intento|Attempt|Essai|Tentativa
Demasiado pronto.|Too early.|Trop tôt.|Cedo demais.
¡Buen ritmo!|Good timing!|Bon rythme !|Bom ritmo!
El marcador estaba fuera de la zona.|The marker was outside the zone.|Le marqueur était hors de la zone.|O marcador estava fora da zona.
¡Aleta se une a tus compañeros!|Aleta has joined your companions!|Aleta rejoint vos compagnons !|Aleta juntou-se aos teus companheiros!
Nuevo récord.|New record.|Nouveau record.|Novo recorde.
Ronda terminada.|Round over.|Manche terminée.|Ronda terminada.
aciertos. +|hits. +|réussites. +|acertos. +
Despierta el cristal del Claro Esmeralda en Valle Chispa.|Awaken the crystal in Emerald Glade in Valle Chispa.|Réveillez le cristal de la Clairière d’émeraude dans Valle Chispa.|Desperta o cristal da Clareira Esmeralda em Valle Chispa.
  `);

  return { t, add, language, locale, translateDocument, setLanguage };
})();

const t = ValleLocale.t;

ValleLocale.add(`
Claro Esmeralda|Emerald Glade|Clairière d’émeraude|Clareira Esmeralda
Cumbre Nevada|Snowy Summit|Sommet enneigé|Cume Nevado
Gruta de Ámbar|Amber Grotto|Grotte d’ambre|Gruta de Âmbar
Bosque Lunar|Moonlit Forest|Forêt lunaire|Floresta Lunar
Islas del Viento|Wind Isles|Îles du vent|Ilhas do Vento
Santuario Astral|Astral Sanctuary|Sanctuaire astral|Santuário Astral
Tienda del claro|Glade Shop|Boutique de la clairière|Loja da clareira
Tienda de la cumbre|Summit Shop|Boutique du sommet|Loja do cume
Tienda de la gruta|Grotto Shop|Boutique de la grotte|Loja da gruta
Tienda del bosque|Forest Shop|Boutique de la forêt|Loja da floresta
Tienda de las islas|Island Shop|Boutique des îles|Loja das ilhas
Tienda del santuario|Sanctuary Shop|Boutique du sanctuaire|Loja do santuário
Atrapa luciérnagas|Catch Fireflies|Chasse aux lucioles|Apanha Pirilampos
Tienes 12 segundos para tocar tantos destellos como puedas.|Tap as many flashes as you can in 12 seconds.|Touchez autant de lueurs que possible en 12 secondes.|Toca no máximo de brilhos em 12 segundos.
Pesca bajo el hielo|Ice Fishing|Pêche sous la glace|Pesca no Gelo
En cuatro intentos, recoge la línea justo cuando pique un pez.|You have four attempts. Reel in as soon as a fish bites.|Vous avez quatre essais. Remontez la ligne dès qu’un poisson mord.|Tens quatro tentativas. Recolhe a linha assim que um peixe morder.
¡Ahora! Recoge el sedal|Now! Reel it in|Maintenant ! Remontez la ligne|Agora! Recolhe a linha
Espera a que pique|Wait for a bite|Attendez que ça morde|Espera que morda
Recoger sedal|Reel in|Remonter la ligne|Recolher a linha
¡Pez atrapado!|Fish caught!|Poisson attrapé !|Peixe apanhado!
El pez ha escapado.|The fish got away.|Le poisson s’est échappé.|O peixe escapou.
Ritmo de la forja|Forge Rhythm|Rythme de la forge|Ritmo da Forja
Golpea cuando el marcador entre en la zona dorada. Tienes seis golpes en 18 segundos.|Strike when the marker enters the golden zone. You have six strikes in 18 seconds.|Frappez quand le repère entre dans la zone dorée. Vous avez six coups en 18 secondes.|Bate quando o marcador entrar na zona dourada. Tens seis golpes em 18 segundos.
Golpear|Strike|Frapper|Bater
Golpe|Strike|Coup|Golpe
Faroles de luna|Moon Lanterns|Lanternes lunaires|Lanternas da Lua
Enciende los faroles que parpadean. Tienes 10 segundos y la luz cambia deprisa.|Light the flickering lanterns. You have 10 seconds and the light moves quickly.|Allumez les lanternes qui clignotent. Vous avez 10 secondes et la lueur change vite.|Acende as lanternas que piscam. Tens 10 segundos e a luz muda depressa.
Corrientes del cielo|Sky Currents|Courants du ciel|Correntes do Céu
Ajusta la vela cuando el marcador esté en la corriente. Tienes seis intentos en 16 segundos.|Adjust the sail when the marker is in the current. You have six attempts in 16 seconds.|Réglez la voile quand le repère est dans le courant. Vous avez six essais en 16 secondes.|Ajusta a vela quando o marcador estiver na corrente. Tens seis tentativas em 16 segundos.
Ajustar la vela|Adjust sail|Régler la voile|Ajustar a vela
Corriente|Current|Courant|Corrente
Ecos del firmamento|Sky Echoes|Échos du firmament|Ecos do Firmamento
Sintoniza la señal en cuanto brille el círculo. Tienes seis intentos.|Tune in as soon as the circle glows. You have six attempts.|Captez le signal dès que le cercle brille. Vous avez six essais.|Sintoniza o sinal assim que o círculo brilhar. Tens seis tentativas.
¡Ahora! Sintoniza el eco|Now! Tune in|Maintenant ! Captez l’écho|Agora! Sintoniza o eco
Espera el eco|Wait for the echo|Attendez l’écho|Espera pelo eco
Sintonizar|Tune in|Capter|Sintonizar
¡Eco sincronizado!|Echo tuned!|Écho capté !|Eco sintonizado!
El eco se ha desvanecido.|The echo faded.|L’écho s’est dissipé.|O eco desvaneceu-se.
Manos al cristal|Hands on the Crystal|Mains sur le cristal|Mãos no Cristal
Recoge chispas con 30 pulsaciones.|Collect sparks with 30 taps.|Récoltez des étincelles avec 30 pressions.|Recolhe faíscas com 30 toques.
Casa en el claro|A Home in the Glade|Un foyer dans la clairière|Casa na Clareira
Adopta un compañero del claro.|Adopt a glade companion.|Adoptez un compagnon de la clairière.|Adota um companheiro da clareira.
Luz entre la hierba|Light in the Grass|Lueur dans l’herbe|Luz na Erva
Atrapa 5 luciérnagas en una ronda.|Catch 5 fireflies in one round.|Attrapez 5 lucioles en une manche.|Apanha 5 pirilampos numa ronda.
Pescador de la cumbre|Summit Angler|Pêcheur du sommet|Pescador do Cume
Pesca 2 peces en una ronda.|Catch 2 fish in one round.|Attrapez 2 poissons en une manche.|Pesca 2 peixes numa ronda.
Refugio nevado|Snowy Shelter|Refuge enneigé|Abrigo Nevado
Consigue un compañero de la cumbre.|Get a summit companion.|Obtenez un compagnon du sommet.|Consegue um companheiro do cume.
Rumbo al hielo|Into the Ice|Vers la glace|Rumo ao Gelo
Alcanza 1.500 chispas acumuladas.|Reach 1,500 total sparks.|Atteignez 1 500 étincelles cumulées.|Alcança 1 500 faíscas acumuladas.
Ritmo de fuego|Fire Rhythm|Rythme du feu|Ritmo do Fogo
Acierta 3 golpes en una ronda de forja.|Land 3 strikes in one forge round.|Réussissez 3 coups en une manche de forge.|Acerta 3 golpes numa ronda da forja.
Vida subterránea|Life Underground|Vie souterraine|Vida Subterrânea
Adopta un compañero de la gruta.|Adopt a grotto companion.|Adoptez un compagnon de la grotte.|Adota um companheiro da gruta.
Cambiaformas|Shapeshifter|Métamorphe|Metamorfo
Evoluciona a cualquier compañero.|Evolve any companion.|Faites évoluer un compagnon.|Evolui qualquer companheiro.
Camino iluminado|Lantern Path|Chemin éclairé|Caminho Iluminado
Enciende 9 faroles en una ronda.|Light 9 lanterns in one round.|Allumez 9 lanternes en une manche.|Acende 9 lanternas numa ronda.
Habitantes nocturnos|Night Dwellers|Habitants nocturnes|Habitantes Noturnos
Adopta 2 compañeros del bosque.|Adopt 2 forest companions.|Adoptez 2 compagnons de la forêt.|Adota 2 companheiros da floresta.
Guardián de los arcos|Guardian of the Arches|Gardien des arches|Guardião dos Arcos
Alcanza 2.500.000 chispas acumuladas.|Reach 2,500,000 total sparks.|Atteignez 2 500 000 étincelles cumulées.|Alcança 2 500 000 faíscas acumuladas.
Viento a favor|Tailwind|Vent arrière|Vento a Favor
Acierta 5 corrientes en una ronda.|Catch 5 currents in one round.|Réussissez 5 courants en une manche.|Acerta 5 correntes numa ronda.
Bandada de altura|Highland Flock|Volée d’altitude|Bando das Alturas
Adopta 2 compañeros de las islas.|Adopt 2 island companions.|Adoptez 2 compagnons des îles.|Adota 2 companheiros das ilhas.
En la cima del cielo|Top of the Sky|Au sommet du ciel|No Topo do Céu
Alcanza 40.000.000 chispas acumuladas.|Reach 40,000,000 total sparks.|Atteignez 40 000 000 étincelles cumulées.|Alcança 40 000 000 faíscas acumuladas.
Sintonía estelar|Star Tuning|Accord stellaire|Sintonia Estelar
Sintoniza los 6 ecos en una ronda.|Tune into all 6 echoes in one round.|Captez les 6 échos en une manche.|Sintoniza os 6 ecos numa ronda.
Compañía de las estrellas|Star Companions|Compagnie des étoiles|Companhia das Estrelas
Adopta 2 compañeros del santuario.|Adopt 2 sanctuary companions.|Adoptez 2 compagnons du sanctuaire.|Adota 2 companheiros do santuário.
Constelación completa|Full Constellation|Constellation complète|Constelação Completa
Alcanza 1.000.000.000 chispas acumuladas.|Reach 1,000,000,000 total sparks.|Atteignez 1 000 000 000 étincelles cumulées.|Alcança 1 000 000 000 de faíscas acumuladas.
Compañeros|Companions|Compagnons|Companheiros
Los compañeros viven en el mapa donde los adoptas y producen chispas estés donde estés.|Companions live on the map where you adopt them and produce sparks wherever you are.|Vos compagnons vivent sur la carte où vous les adoptez et produisent des étincelles où que vous soyez.|Os companheiros vivem no mapa onde os adotas e produzem faíscas onde quer que estejas.
Zorro de hojas|Leaf fox|Renard feuillu|Raposa de folhas
Duende seta|Mushroom sprite|Lutin champignon|Duende cogumelo
Murciélago de niebla|Mist bat|Chauve-souris des brumes|Morcego da névoa
Salamandra de brasa|Ember salamander|Salamandre de braise|Salamandra de brasa
Liebre de nieve|Snow hare|Lièvre des neiges|Lebre da neve
Búho de la aurora|Aurora owl|Hibou de l’aurore|Coruja da aurora
Pez que flota en una burbuja|Fish floating in a bubble|Poisson flottant dans une bulle|Peixe que flutua numa bolha
Tortuga de roca y jade|Stone and jade turtle|Tortue de roche et de jade|Tartaruga de rocha e jade
Polilla de chispa|Spark moth|Papillon de nuit des étincelles|Traça das faíscas
Ardilla del robledal|Oak grove squirrel|Écureuil de la chênaie|Esquilo do carvalhal
Foca de las nieves|Snow seal|Phoque des neiges|Foca das neves
Topo de basalto|Basalt mole|Taupe de basalte|Toupeira de basalto
Polilla de los faroles|Lantern moth|Papillon de nuit des lanternes|Traça das lanternas
Cervatillo de la luna|Moon fawn|Faon de la lune|Cria de veado da lua
Ajolote de la cascada|Waterfall axolotl|Axolotl de la cascade|Axolote da cascata
Ardilla planeadora|Flying squirrel|Écureuil volant|Esquilo voador
Oveja de algodón de nube|Cloud-wool sheep|Mouton de laine de nuage|Ovelha de lã de nuvem
Halcón de las corrientes|Wind falcon|Faucon des courants|Falcão das correntes
Planeta diminuto con anillos|Tiny ringed planet|Petite planète à anneaux|Planeta minúsculo com anéis
Zorro de polvo estelar|Stardust fox|Renard de poussière d’étoiles|Raposa de poeira estelar
Dragón del firmamento|Sky dragon|Dragon du firmament|Dragão do firmamento
Mejoras|Upgrades|Améliorations|Melhorias
Las mejoras aumentan tu producción en todos los mapas.|Upgrades boost production on all maps.|Les améliorations augmentent la production sur toutes les cartes.|As melhorias aumentam a produção em todos os mapas.
Pico de cobre|Copper Pickaxe|Pioche en cuivre|Picareta de Cobre
Una chispa más por pulsación y nivel|One extra spark per tap and level|Une étincelle de plus par pression et par niveau|Mais uma faísca por toque e nível
Molino de agua|Watermill|Moulin à eau|Moinho de Água
Dos chispas por segundo y nivel|Two sparks per second and level|Deux étincelles par seconde et par niveau|Duas faíscas por segundo e nível
Pico de escarcha|Frost Pickaxe|Pioche de givre|Picareta de Gelo
Cuatro chispas más por pulsación y nivel|Four extra sparks per tap and level|Quatre étincelles de plus par pression et par niveau|Mais quatro faíscas por toque e nível
Forja de ámbar|Amber Forge|Forge d’ambre|Forja de Âmbar
Cuarenta chispas por segundo y nivel|Forty sparks per second and level|Quarante étincelles par seconde et par niveau|Quarenta faíscas por segundo e nível
Farol de luna|Moon Lantern|Lanterne lunaire|Lanterna da Lua
600 chispas por segundo y nivel|600 sparks per second and level|600 étincelles par seconde et par niveau|600 faíscas por segundo e nível
Molino celeste|Sky Mill|Moulin céleste|Moinho Celeste
9.000 chispas por segundo y nivel|9,000 sparks per second and level|9 000 étincelles par seconde et par niveau|9 000 faíscas por segundo e nível
Observatorio|Observatory|Observatoire|Observatório
80.000 chispas por segundo y nivel|80,000 sparks per second and level|80 000 étincelles par seconde et par niveau|80 000 faíscas por segundo e nível
Gemas|Gems|Gemmes|Gemas
El cristal que equipes te acompaña al viajar.|Your equipped crystal travels with you.|Votre cristal équipé vous accompagne en voyage.|O cristal equipado acompanha-te nas viagens.
Esmeralda|Emerald|Émeraude|Esmeralda
El cristal original del valle|The valley’s original crystal|Le cristal d’origine de la vallée|O cristal original do vale
Ámbar solar|Solar Amber|Ambre solaire|Âmbar Solar
Color miel con un destello dorado|Honey-coloured with a golden shine|Couleur miel avec un éclat doré|Cor de mel com um brilho dourado
Luna helada|Frozen Moon|Lune gelée|Lua Gelada
Azul claro con vetas de escarcha|Light blue with streaks of frost|Bleu clair aux veines de givre|Azul-claro com veios de gelo
Amatista|Amethyst|Améthyste|Ametista
Violeta con reflejos rosados|Purple with pink highlights|Violet aux reflets roses|Violeta com reflexos cor-de-rosa
Prisma boreal|Aurora Prism|Prisme boréal|Prisma Boreal
Facetas verdes, celestes y lilas|Green, sky-blue and lilac facets|Facettes vertes, bleu ciel et lilas|Facetas verdes, azul-celeste e lilases
Corazón de magma|Magma Heart|Cœur de magma|Coração de Magma
Un núcleo rojo de brillo dorado|A red core with a golden glow|Un noyau rouge à l’éclat doré|Um núcleo vermelho com brilho dourado
Piedra de luna|Moonstone|Pierre de lune|Pedra da Lua
Facetas violetas bajo luz de luna|Purple facets in the moonlight|Facettes violettes au clair de lune|Facetas violetas sob a luz da lua
Cristal del viento|Wind Crystal|Cristal du vent|Cristal do Vento
Un prisma de cielo y oro|A prism of sky and gold|Un prisme de ciel et d’or|Um prisma de céu e ouro
Núcleo astral|Astral Core|Noyau astral|Núcleo Astral
Profundo azul con un centro estelar|Deep blue with a star at its centre|Bleu profond avec une étoile au centre|Azul profundo com uma estrela no centro
Efectos|Effects|Effets|Efeitos
Prueba los efectos y elige cuál aparece al pulsar en el escenario.|Preview effects and choose which one appears when you tap the scene.|Essayez les effets et choisissez celui qui apparaît quand vous touchez le décor.|Experimenta os efeitos e escolhe o que aparece quando tocas no cenário.
Destellos|Flashes|Éclats|Brilhos
Partículas doradas y verdes|Gold and green particles|Particules dorées et vertes|Partículas douradas e verdes
Hojitas|Leaves|Feuilles|Folhinhas
Hojas que giran en el aire|Leaves spinning in the air|Feuilles qui tourbillonnent|Folhas que giram no ar
Ondas|Ripples|Ondes|Ondas
Anillos de luz que se expanden|Expanding rings of light|Anneaux de lumière qui s’élargissent|Anéis de luz que se expandem
Constelación|Constellation|Constellation|Constelação
Estrellas lilas y blancas|Lilac and white stars|Étoiles lilas et blanches|Estrelas lilases e brancas
Escarcha|Frost|Givre|Geada
Copos celestes que se dispersan|Scattering pale-blue snowflakes|Flocons bleu ciel qui se dispersent|Flocos azul-celeste que se dispersam
Brasas|Embers|Braises|Brasas
Píxeles incandescentes de la gruta|Glowing pixels from the grotto|Pixels incandescents de la grotte|Píxeis incandescentes da gruta
Pétalos de luna|Moon Petals|Pétales de lune|Pétalas da Lua
Pétalos violetas del bosque|Purple petals from the forest|Pétales violets de la forêt|Pétalas violetas da floresta
Ráfagas|Gusts|Rafales|Rajadas
Trazos de viento en color menta|Mint-green trails of wind|Traînées de vent vert menthe|Traços de vento verde-menta
Lluvia estelar|Star Shower|Pluie d’étoiles|Chuva Estelar
Estrellas doradas y violetas|Gold and purple stars|Étoiles dorées et violettes|Estrelas douradas e violetas
`);

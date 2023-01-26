let showArtworkSocket;

Hooks.on('renderActorSheet', (app, html, data) => {
    if (game.user.isGM) {
        let labelTxt = 'Share Artwork';
        let labelStyle= "";
        let title = "Share Artwork";

        let openBtn = $(`<a class="share-artwork" title="${title}" ${labelStyle} ><i class="fas fa-eye"></i>${labelTxt}</a>`);
        openBtn.click(ev => {
            const ip = new ImagePopout(data.actor.img, {
                title: data.actor.name,
                shareable: true,
            });
    
            // Display the image popout
            ip.render(false);
            
            // Share the image with other connected players
            ip.shareImage();
        });
        html.closest('.app').find('.share-artwork').remove();
        let titleElement = html.closest('.app').find('.window-title');
        openBtn.insertAfter(titleElement);
    }
});

Hooks.on('renderItemSheet', (app, html, data) => {
    if (game.user.isGM) {
        let labelTxt = 'Share Artwork';
        let labelStyle= "";
        let title = '"shift-click" to view';

        let openBtn = $(`<a class="share-artwork" title="${title}" ${labelStyle} ><i class="fas fa-eye"></i>${labelTxt}</a>`);
        openBtn.click(ev => {
            const ip = new ImagePopout(data.item.img, {
                title: data.item.name,
                shareable: true,
            });

            let selfRender = false;

            // Render the image popout to the person who clicked if the 'shift' key is held down
            if( ev.shiftKey == true ) {
                selfRender = true;
                ip.render(selfRender);
            }
            else {
                ip.render(false);
                // Share the image with other connected players
                ip.shareImage();
            }            
        });

        html.closest('.app').find('.share-artwork').remove();
        let titleElement = html.closest('.app').find('.window-title');
        openBtn.insertAfter(titleElement);
    }
});

// Unrelated attempt to alert people when someone else is editing a journal document.
// Ultimately if this works, will make a different module
Hooks.on('renderJournalSheet', (app, html, data) => {
    let title = "Edit Warning";
    labelStyle = 'style ="color: red"';
    labelText = "BEING EDITED";
  
    let editWarning = $(`<h4 class="edit-warning" title="edit warning" ${labelStyle}>${labelText}</h4>`);
    let titleElement = html.closest('.app').find('.window-title');
   
    // if someone is editing the document, provide the warning:
    clearActive();
    showArtworkSocket.executeForOthers(checkForEditActive, data.data._id);
    if( isActive() ) {
        editWarning.insertAfter(titleElement);
    }
});

Hooks.once("socketlib.ready", () => {
    console.log('share-artwork registering with socketlib');
    showArtworkSocket = socketlib.registerModule("share-artwork");
    showArtworkSocket.register("checkForEditActive", checkForEditActive);
    showArtworkSocket.register("setActive", setActive);
    showArtworkSocket.register("clearActive", clearActive);
});

async function checkForEditActive( id ) {
    const j = game.journal.get(id);
    if( j.sheet.editors?.content?.active == true ) {
        showArtworkSocket.executeForOthers(setActive);
    }
}
let active = false;
async function setActive() {
    active = true;
}

async function clearActive() {
    active = false;
}

function isActive() {
    return active;
}
// End of unrelated attempt to show editing warning
//
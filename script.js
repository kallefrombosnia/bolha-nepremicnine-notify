// ==UserScript==
// @name         Bolha.com & Nepremicnine.com scanner
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Scan and notify on the new posts
// @run-at       document-idle
// @author       kallefrombosnia
// @match        https://www.bolha.com/*
// @match        https://www.nepremicnine.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(async function() {
    'use strict';

    setTimeout(function(){
        console.log('Reloading page...')
        window.location.reload();
    }, 60000); // Reload page every minute

    async function sendPushNotification(title, data, url)
    {
        const key = "k-76..."; // Add own key
        return await fetch(`https://xdroid.net/api/message?k=${key}&title=${title}&c=${data}&u=${url}`);
    }

    console.log('Starting scanner...');

    const data = getState();

    setTimeout(async() => {

        const bC = getBolhaCounter();
        const nC = getNepreCounter();
        const domain = getDomainWithoutTld();

        console.log(`Scanning site ${domain} with ${nC} currently published ads.`)

        // First run - no data saved
        if(Object.keys(data).length === 0) {

            console.log('No state found, fresh start...')

            switch(domain) {
                case 'bolha':

                    console.log(`Detected site ${domain} with ${bC} published ads.`)

                    setState({
                        'type' : 'bolha',
                        'counter' : bC
                    })

                    await sendPushNotification('Starting bolha', `Bolha - Counter: ${bC}`, window.location.href)

                    break;


                case 'nepremicnine':

                    console.log(`Detected site ${domain} with ${nC} published ads.`)

                    setState({
                        'type' : 'nepremicnine',
                        'counter' : nC
                    })

                    await sendPushNotification('Starting nepremicnine', `Nepremicnine - Counter: ${nC}`, window.location.href)

                    break;

                default:
                    console.log('Unknown website :/')
            }

        } else {

            // Already running scanner
            console.log('Found previous state, loading...')

            switch(data.type) {

                case 'bolha':

                    console.log(`Scanning site ${domain} with ${bC} currently published ads.`)

                    // Found new post
                    if(parseInt(data.counter) < parseInt(bC)){

                        console.log(`Found a new post!`)

                        setState({
                            'type' : 'bolha',
                            'counter' : bC
                        })

                        // Send a notification
                        await sendPushNotification('Scanning bolha', `Bolha new - Counter: ${bC}`, window.location.href)
                    }

                    // Post deleted
                    if(parseInt(data.counter) > parseInt(bC)){

                        console.log(`Post deleted!`)

                        setState({
                            'type' : 'bolha',
                            'counter' : bC
                        })

                    }

                    break;


                case 'nepremicnine':

                    console.log(`Scanning site ${domain} with ${nC} currently published ads.`)

                    // Found new post
                    if(parseInt(data.counter) < parseInt(nC)){

                        console.log(`Found a new post!`)

                        setState({
                            'type' : 'nepremicnine',
                            'counter' : nC
                        })

                        // Send a notification
                        await sendPushNotification('Scanning nepremicnine', `Nepremicnine new - Counter: ${nC}`, window.location.href)
                    }

                    // Post deleted
                    if(parseInt(data.counter) > parseInt(nC)){

                        console.log(`Post deleted!`)

                        setState({
                            'type' : 'nepremicnine',
                            'counter' : nC
                        })

                    }

                    break;

                default:
                    console.log('Unknown website :/')
            }
        }

    }, 10000);

    function getDomainWithoutTld() {
        const domain = new URL(window.location.href).hostname;
        const parts = domain.split('.');
        if (parts.length > 2 && parts[0].toLowerCase() === 'www') {
            parts.shift(); // Remove the "www" subdomain
        }
        if (parts.length > 1) {
            parts.pop(); // Remove the TLD
        }
        return parts.join('.');
    }

    function getBolhaCounter()
    {
        return document.querySelector("#form_browse_detailed_search > div > div.content-main > div.block-standard.block-standard--epsilon > header > div.entity-list-meta > strong")?.innerText;
    }

    function getNepreCounter()
    {
        return document.querySelector("#vsebina200 > div.facet > div.oglasi_cnt > strong")?.innerText;
    }

    /**
      Setter
    */
    function setState(state)
    {
        return GM_setValue(`state_${getDomainWithoutTld()}`, JSON.stringify(state));
    }

    /**
      Getter
    */
    function getState()
    {
        return JSON.parse(GM_getValue(`state_${getDomainWithoutTld()}`, '{}'));
    }

})();

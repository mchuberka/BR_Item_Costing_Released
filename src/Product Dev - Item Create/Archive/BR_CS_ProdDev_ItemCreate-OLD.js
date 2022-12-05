/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType ClientScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4387798404.html
 */
define(['N/currentRecord', 'N/record', 'N/url', 'N/log'],

    /**
     * @return {{
     *   pageInit?: Function,
     * }}
     */
    function (currentRecord, recordModule, urlModule, logModule) {

        /**
         * Used in logs to help identify which client script is doing the logging
         * @type {string}
         */
        const SCRIPT_FILENAME = 'BR_CS_ProdDev_ItemCreate.js';

        /**
         * @param {PageInitContext} context
         * @return {void}
         */
        function pageInit(context) {
            try {
                console.log(SCRIPT_FILENAME + ': pageInit:', context);
                // add button in script record

            } catch (e) {
                console.error(SCRIPT_FILENAME + ': pageInit:', e);
            }
        }

        function onButtonClick(){
            try{
                //load field values


                //create record


                //set field values


                //go to new record

            } catch (e){
                console.error('CS Error ' + e)
                logModule.error({title: 'Error', details: e});
            }
        }


        return {
            pageInit: pageInit,
            onButtonClick: onButtonClick
        };

    }
);

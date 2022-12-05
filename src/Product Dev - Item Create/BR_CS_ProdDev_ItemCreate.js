/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType ClientScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4387798404.html
 */

/**
 * On button click from the User Event Script, takes parameters from the product development record and popups a
 * confirmation box
 */

define(['N/currentRecord', 'N/record', 'N/url'],

    function (currentRecord, recordModule, urlModule) {

        function pageInit(){}

        function createNewItem(recId){
            try{
                console.log('Function: createNewItem Started');
                var rec = recordModule.load({
                    type: 'customrecord_br_item_master_itdv',
                    id: recId
                });

                //load field values
                var description = rec.getValue('custrecord_br_itdv_item');
                    console.log('Description: ' + description);
                var purchasePrice = rec.getValue('custrecord_br_itdv_item_purchase_price');
                var fbaItem = rec.getValue('custrecord_br_itdv_fba');
                    console.log('FBA Item: ' + fbaItem);
                var bulkItem = rec.getValue('custrecord_br_itdv_bulk_item');
                var countryOfOrigin = rec.getValue('custrecord_br_itdv_country_of_origin');
                    console.log('Country: ' + countryOfOrigin);
                var htsCode = rec.getValue('custrecord_br_itdv_hts_code');
                var preferredVendor = rec.getValue('custrecord_br_itdv_item_preferred_vendor');
                var itemLength = rec.getValue('custrecord_br_itdv_item_length');
                var itemWidth = rec.getValue('custrecord_br_itdv_item_width');
                var itemHeight = rec.getValue('custrecord_br_itdv_item_height');
                var itemWeight = rec.getValue('custrecord_br_itdv_item_weight');
                var basePrice = rec.getValue('custrecord_br_itdv_item_base_price');
                //todo add category
                //todo add family
                
                if(fbaItem == true){
                    fbaItem = 'T';
                } else {
                    fbaItem = 'F';
                }

                if(bulkItem == true){
                    bulkItem = 'T';
                } else {
                    bulkItem = 'F';
                }

                //Call the Suitelet and pass values
                var suiteletURL = urlModule.resolveScript({
                    scriptId: 'customscript_br_sl_proddev_item_create',
                    deploymentId: 'customdeploy_br_sl_proddev_item_create',
                    returnExternalUrl: false,
                    params: {
                        'description': description,
                        'purchasePrice': purchasePrice,
                        'fbaItem': fbaItem,
                        'bulkItem': bulkItem,
                        'countryOfOrigin': countryOfOrigin,
                        'htsCode': htsCode,
                        'preferredVendor': preferredVendor,
                        'itemLength': itemLength,
                        'itemWidth': itemWidth,
                        'itemHeight': itemHeight,
                        'itemWeight': itemWeight,
                        'basePrice': basePrice,
                        //todo add category
                        //todo add family
                    }
                });
                console.log('URL Created: ' + suiteletURL);

                window.open(suiteletURL);

            } catch (e){
                console.error('Client Script Error ' + e)
            }
        }

        return {
            pageInit: pageInit,
            createNewItem: createNewItem
        };

    }
);

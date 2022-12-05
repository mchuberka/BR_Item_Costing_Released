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
                var basePrice = rec.getValue('custrecord_br_itdv_item_weight');
                
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

                //Create the item record and pass Main Line values
                var newItemURL = urlModule.resolveRecord({
                    recordType: recordModule.Type.INVENTORY_ITEM,
                    isEditMode: true,
                    params: {
                        'record.displayname':description,
                        'record.purchasedescription':description,
                        'record.cost':purchasePrice,
                        'record.custitem_fa_amz_fba':fbaItem,
                        'record.customise_bulk_item':bulkItem,
                        'record.custitemcountry_of_origin':countryOfOrigin,
                        'record.custitem_htscode':htsCode,
                        'record.custitemsku_dim_len':itemLength,
                        'record.custitemsku_dim_wid':itemWidth,
                        'record.custitemsku_dim_ht':itemHeight,
                        'record.weight':itemWeight,
                        'record.custitem_product_status': '3'
                    }
                });
                console.log('URL Created: ' + newItemURL);

                //Set Sublist values
                    //Preferred Vendor

                    //Base Price
/*                recordModule.setSublistValue({
                    sublistId: 'price1',
                    fieldId: 'price_1_',
                    line: 0,
                    value: basePrice
                });*/

                window.open(newItemURL);

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

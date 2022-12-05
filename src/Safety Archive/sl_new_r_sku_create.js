/**

 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/redirect', 'N/ui/serverWidget','N/log'],
    /**
     * @param {search} search
     * @param {record} record
     * @param {redirect} redirect
     * @param {serverWidget} serverWidget
     * @param {log} log
     */
    function(search, record, redirect, serverWidget, log) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {


        //create form
            var form = serverWidget.createForm({
                title: 'CREATE R-SKU',
                hideNavBar: false
            });

            //add instructions
                var instructions = form.addField({
                    id: 'custpage_instructions',
                    type: serverWidget.FieldType.RICHTEXT,
                    label: 'Instructions'
                });
                instructions.richTextWidth = 250;
                instructions.richTextHeight = 100;
                instructions.defaultValue = 'Enter the ORIGINAL item number that you are creating an R-Sku for.  You may optionally enter an initial quantity on hand for the BRE location.  Upon submission you will be taken to the new record to make adjustments.  The Base Price will be set to 85% of the Base Price of the original item.  Amazon flag to sync will be set to IGNORE ITEM.';
                instructions.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                instructions.updateLayoutType({layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE});

            //add an "Item ID" field
                var itemField = form.addField({
                    id: 'custpage_origitem',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Original Item'
                });
                itemField.isMandatory = true;
                itemField.updateDisplaySize({height: 60, width: 15});
                itemField.setHelpText({help: 'Enter the original item number that you are creating the R-SKU for. Do NOT put the new R-sku name that you are creating!'});

            //add an "Initial Inventory for BRE" field
                var initialInventory = form.addField({
                    id: 'custpage_initinventory',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Initial BRE Inventory'
                });
                initialInventory.updateLayoutType({layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW});
                initialInventory.updateDisplaySize({height: 60, width: 10});
                initialInventory.defaultValue = '0';
                initialInventory.setHelpText({help: 'Enter the original quantity to assign for the new R-SKU. NOTE: This will place the inventory in BRE and generate an Inventory Adjustment Record'});

            //add a submit button
            form.addSubmitButton({label: 'Create R-Sku'});

            context.response.writePage(form);

        //if the form has been submitted
            if (context.request.method == 'POST'){

        //set default item and inventory values
               itemField.defaultValue = context.request.parameters.custpage_origitem;
               initialInventory.defaultValue = context.request.parameters.custpage_initinventory;

            //get internal ID of original Item
            var itemSearchResult = search.create({
                type: 'inventoryitem',
                filters: [{name: 'itemid', operator: 'is', values: itemField.defaultValue }]
            }).run().getRange({ start: 0, end: 1 });
            var itemInternalId = itemSearchResult[0].id;


                // Load the original Item Record
                var oSKU = record.load ({
                    type: record.Type.INVENTORY_ITEM,
                    id: itemInternalId,
                    isDynamic: false
                });

                //load the original item values
                var upc = oSKU.getValue ({fieldId: 'upccode'});
                var displayName = oSKU.getValue ({fieldId: 'displayname'});
                var productStatus = oSKU.getValue ({fieldId: 'custitem_product_status'});
                var countryOfOrigin = oSKU.getValue ({fieldId: 'custitemcountry_of_origin'});
              	var htsCode = oSKU.getValue ({fieldId: 'custitem_htscode'});
                var dutyRate = oSKU.getValue ({fieldId: 'custitemduty_rate'});
                var purchaseDescription = oSKU.getValue ({fieldId: 'purchasedescription'});
                var maxQtyPerLabel = oSKU.getValue ({fieldId: 'custitemmax_qty_label'});
                var amazonCategory = oSKU.getValue ({fieldId: 'custitem_fa_amz_category'});
                var amazonSizeTier = oSKU.getValue ({fieldId: 'custitem_br_amazon_size_tier'});
                var marketplaceProductName = oSKU.getValue ({fieldId: 'custitem_br_marketplace_product_name'});
                var amazonProductType = oSKU.getValue ({fieldId: 'custitem_fa_amz_prod_type'});
                var amazonItemType = oSKU.getValue({fieldId: 'custitem_fa_amz_item_type'});
                var amazonASIN = oSKU.getValue ({fieldId: 'custitem_fa_amz_asin'});
                var singlePackLength = oSKU.getValue ({fieldId: 'custitemsku_dim_len'});
                var singlePackWidth = oSKU.getValue ({fieldId: 'custitemsku_dim_wid'});
                var singlePackHeight = oSKU.getValue ({fieldId: 'custitemsku_dim_ht'});
                var weight = oSKU.getValue ({fieldId: 'weight'});
                var amazonDisplayName = oSKU.getValue ({fieldId: 'custitem_br_displayname'});


                var hierarchyNode = oSKU.getSublistValue({sublistId: 'hierarchyversions', fieldId: 'hierarchynode', line: 1});
                    log.debug('Hierarchy', 'Node: '+hierarchyNode);
                var hierarchyVersion = oSKU.getSublistValue({sublistId: 'hierarchyversions', fieldId: 'hierarchyversion', line: 1});
                    log.debug('Hierarchy', 'Version: '+hierarchyVersion);
                var hierarchyIncluded = oSKU.getSublistValue({sublistId: 'hierarchyversions', fieldId: 'isincluded', line: 1});
                    log.debug('Hierarchy', 'Included: '+hierarchyIncluded);
                var origPrice = oSKU.getSublistValue({sublistId: 'price1', fieldId: 'price_1_', line: 0});
                    log.debug('Pricing', 'origPrice: '+origPrice);

                var basePrice = (origPrice * 0.75);
                    basePrice = basePrice.toFixed(2);
                    log.debug('Pricing', 'basePrice: ',+basePrice);

                //create the Rsku Name
                var rSKU = 'R' + itemField.defaultValue;
                    //log check
                    log.debug('RSKU','name: '+rSKU);

                // Create the RSKU Record
                var newRsku = record.create({
                    type : record.Type.INVENTORY_ITEM,
                    isDynamic : false,
                });

                //set tne primary fields
                newRsku.setValue({fieldId: 'itemid', value: rSKU});
                newRsku.setValue({fieldId: 'upccode', value: upc});
                newRsku.setValue({fieldId: 'displayname', value: displayName});
                newRsku.setValue({fieldId: 'custitem_product_status', value: 14});
                newRsku.setValue({fieldId: 'custitemcountry_of_origin', value: countryOfOrigin});
                newRsku.setValue({fieldId: 'custitem_htscode', value: htsCode});
                newRsku.setValue({fieldId: 'custitemduty_rate', value: dutyRate});
                newRsku.setValue({fieldId: 'purchasedescription', value: purchaseDescription});
                newRsku.setValue({fieldId: 'custitemmax_qty_label', value: maxQtyPerLabel});
                newRsku.setValue({fieldId: 'custitem_fa_amz_category', value: amazonCategory});
                newRsku.setValue({fieldId: 'custitem_br_amazon_size_tier', value: amazonSizeTier});
                newRsku.setValue({fieldId: 'custitem_br_marketplace_product_name', value: marketplaceProductName});
                newRsku.setValue({fieldId: 'custitem_fa_amz_prod_type', value: amazonProductType});
                newRsku.setValue({fieldId: 'custitem_fa_amz_item_type', value: amazonItemType});
                newRsku.setValue({fieldId: 'custitem_fa_amz_asin', value: amazonASIN});
                newRsku.setValue({fieldId: 'custitemsku_dim_len', value: singlePackLength});
                newRsku.setValue({fieldId: 'custitemsku_dim_wid', value: singlePackWidth});
                newRsku.setValue({fieldId: 'custitemsku_dim_ht', value: singlePackHeight});
                newRsku.setValue({fieldId: 'weight', value: weight});
                newRsku.setValue({fieldId: 'custitem_br_displayname', value: amazonDisplayName});
                newRsku.setValue({fieldId: 'custitem_fa_amz_cond_type', value: 3}); //Used - Like New
                newRsku.setValue({fieldId: 'custitem_fa_amz_flag', value: 3}); // TODO Add/Update Item (Set to 1 on deploy)
                newRsku.setValue({fieldId: 'custitem_ebay_item_condition', value: 4}); // Manufacturer Refurbished
                newRsku.setValue({fieldId: 'custitemamazon_qty_buffer', value: '0'});
                newRsku.setValue({fieldId: 'custitem_br_renostock', value: '0'});
                newRsku.setValue({fieldId: 'custitem_br_kfcstock', value: '0'});
                newRsku.setValue({fieldId: 'custitem_br_brestock', value: initialInventory.defaultValue});
                newRsku.setValue({fieldId: 'custitem_br_syncstock', value: initialInventory.defaultValue});

                //set Initial Quantity
                newRsku.setSublistValue({sublistId: 'locations', fieldId: 'quantityonhand', line: 1, value: initialInventory.defaultValue});

                //set merchandise hierarchy
                newRsku.setSublistValue({sublistId: 'hierarchyversions', fieldId: 'hierarchyversion', line: 1, value: hierarchyVersion});
                newRsku.setSublistValue({sublistId: 'hierarchyversions', fieldId: 'hierarchynode', line: 1, value: hierarchyNode});
                newRsku.setSublistValue({sublistId: 'hierarchyversions', fieldId: 'isincluded', line: 1, value: hierarchyIncluded});

                //set base price
                newRsku.setSublistValue({sublistId: 'price1', fieldId: 'price_1_', line: 0, value: basePrice});

                // save the item record
                var rSkuID = newRsku.save();

                //go to the new item record which is created in edit mode.
                redirect.toRecord ({
                    type : record.Type.INVENTORY_ITEM,
                    id   : rSkuID,
                    isEditMode : false
                });
            }

        }

        return {
            onRequest: onRequest
        };

    });

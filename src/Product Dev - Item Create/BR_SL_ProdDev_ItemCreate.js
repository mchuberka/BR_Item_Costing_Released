/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType Suitelet
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4387799600.html
 */


define(['N/record', 'N/redirect', 'N/ui/serverWidget', 'N/log'],


    function (record, redirect,serverWidget, log) {


        function onRequest(context) {
            try {
                log.audit('Function: onRequest Started');

            //load parameters //todo
                var description = context.request.parameters.description;
                    // log.debug({title: 'Description', details: description});
                var purchasePrice = parseFloat(context.request.parameters.purchasePrice);
                var fbaItem = context.request.parameters.fbaItem;
                    // log.debug({title: 'FBA Item', details: fbaItem});
                var bulkItem = context.request.parameters.bulkItem;
                    // log.debug({title: 'Bulk Item', details: bulkItem});
                var countryOfOrigin = context.request.parameters.countryOfOrigin;
                var htsCode = context.request.parameters.htsCode;
                var preferredVendor = context.request.parameters.preferredVendor;
                    // log.debug({title: 'Vendor', details: preferredVendor});
                var itemLength = parseFloat(context.request.parameters.itemLength);
                var itemWidth = parseFloat(context.request.parameters.itemWidth);
                var itemHeight = parseFloat(context.request.parameters.itemHeight);
                var itemWeight = parseFloat(context.request.parameters.itemWeight);
                var basePrice = parseFloat(context.request.parameters.basePrice);
                //todo add category
                //todo add family

                
            //create form
                var form = serverWidget.createForm({
                    title: 'CREATE NEW ITEM',
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
                instructions.defaultValue = 'Enter or edit field values that you want to appear on the Item Record.  The only MANDATORY field is the Item Number, which should be set to the sku we want to use.';
                instructions.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                instructions.updateLayoutType({layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE});

            //add fields
                //Item Number
                var itemNumber = form.addField({
                    id: 'custpage_item',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Item Number'
                });
                itemNumber.isMandatory = true;
                itemNumber.updateDisplaySize({height: 60, width: 15});
                itemNumber.setHelpText({help: 'Enter the item Number for the new Item'});

                //UPC Code
                var upcCode = form.addField({
                    id: 'custpage_upccode',
                    type: serverWidget.FieldType.TEXT,
                    label: 'UPC Code'
                });
                upcCode.updateDisplaySize({height: 60, width: 15});
                upcCode.setHelpText({help: 'Enter the UPC Code for the new Item'});


                //Purchase Price
                var purchasePriceField = form.addField({
                    id: 'custpage_purchaseprice',
                    type: serverWidget.FieldType.FLOAT,
                    label: 'purchasePrice'
                });
                    purchasePriceField.updateDisplaySize({height: 60, width: 7});
                    purchasePriceField.defaultValue = purchasePrice;

                //Selling Price (Base Price)
                var basePriceField = form.addField({
                    id: 'custpage_baseprice',
                    type: serverWidget.FieldType.FLOAT,
                    label: 'Selling Price'
                });
                basePriceField.updateDisplaySize({height: 60, width: 7});
                basePriceField.defaultValue = basePrice;

                //FBA Item Checkbox
                var fbaItemField = form.addField({
                    id: 'custpage_fbaitem',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'FBA Item'
                });
                    fbaItemField.defaultValue = fbaItem;

                //Bulk Item Checkbox
                var bulkItemField = form.addField({
                    id: 'custpage_bulkitem',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Bulk Item'
                });
                    bulkItemField.defaultValue = bulkItem;

                //Description
                var itemDescriptionField = form.addField({
                    id: 'custpage_itemdescription',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Item Description'
                });
                itemDescriptionField.defaultValue = description;
                itemDescriptionField.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });

                //Country of Origin
                var countryField = form.addField({
                    id: 'custpage_countryoforigin',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customlistcountry_list',
                    label: 'Country of Origin'
                });
                    countryField.defaultValue = countryOfOrigin;

                //hts Code (tariff)
                var htsField = form.addField({
                    id: 'custpage_htscode',
                    type: serverWidget.FieldType.TEXT,
                    label: 'HTS Code'
                });
                    htsField.updateDisplaySize({height: 60, width: 15});
                    htsField.defaultValue = htsCode;

                //Preferred Vendor
                var vendorField = form.addField({
                    id: 'custpage_preferredvendor',
                    type: serverWidget.FieldType.SELECT,
                    source: 'vendor',
                    label: 'Preferred Vendor'
                });
                    vendorField.defaultValue = preferredVendor;

                //Item Length (in)
                var lengthField = form.addField({
                    id: 'custpage_length',
                    type: serverWidget.FieldType.FLOAT,
                    label: 'Length'
                });
                    lengthField.updateDisplaySize({height: 60, width: 7});
                    lengthField.defaultValue = itemLength;
                    lengthField.updateBreakType({
                        breakType: serverWidget.FieldBreakType.STARTCOL
                    });

                //Item Width (in)
                var widthField = form.addField({
                    id: 'custpage_width',
                    type: serverWidget.FieldType.FLOAT,
                    label: 'Width'
                });
                    widthField.updateDisplaySize({height: 60, width: 7});
                    widthField.defaultValue = itemWidth;

                //Item Height (in)
                var heightField = form.addField({
                    id: 'custpage_height',
                    type: serverWidget.FieldType.FLOAT,
                    label: 'Height'
                });
                    heightField.updateDisplaySize({height: 60, width: 7});
                    heightField.defaultValue = itemHeight;

                //Item Weight (lbs)
                var weightField = form.addField({
                    id: 'custpage_weight',
                    type: serverWidget.FieldType.FLOAT,
                    label: 'Weight'
                });
                    weightField.updateDisplaySize({height: 60, width: 7});
                    weightField.defaultValue = itemWeight;


                //Merchandise Hierarchy - Category
                var categoryField = form.addField({
                    id: 'custpage_category',
                    type: serverWidget.FieldType.SELECT,
                    source: 'merchandisehierarchynode',
                    label: 'Category'
                });
                    categoryField.updateBreakType({
                        breakType: serverWidget.FieldBreakType.STARTCOL
                    });


                //Merchandise Hierarchy - Family
                var familyField = form.addField({
                    id: 'custpage_family',
                    type: serverWidget.FieldType.SELECT,
                    source: 'merchandisehierarchynode',
                    label: 'Family'
                });

                //add a submit button
                form.addSubmitButton({label: 'Create Item'});

                context.response.writePage(form);

            //if the form has been submitted
                if (context.request.method == 'POST'){

                //Set Default values
                    itemNumber = context.request.parameters.custpage_item;
            log.debug({title: 'Item', details: itemNumber});
                    upcCode = context.request.parameters.custpage_upccode;
            log.debug({title: 'UPC', details: upcCode});
                    description = context.request.parameters.custpage_itemdescription;
            log.debug({title: 'Description', details: description});
                    purchasePrice = parseFloat(context.request.parameters.custpage_purchaseprice);
            log.debug({title: 'Purchase Price', details: purchasePrice});
                    fbaItem = context.request.parameters.custpage_fbaitem;
                    bulkItem = context.request.parameters.custpage_bulkitem;
                    countryOfOrigin = context.request.parameters.custpage_countryoforigin;
            log.debug({title: 'Country ID', details: countryOfOrigin});
                    htsCode = context.request.parameters.custpage_htscode;
            log.debug({title: 'HTS Code', details: htsCode});
                    preferredVendor = context.request.parameters.custpage_preferredvendor;
            log.debug({title: 'Vendor', details: preferredVendor});
                    itemLength = parseFloat(context.request.parameters.custpage_length);
            log.debug({title: 'Length', details: itemLength});
                    itemWidth = parseFloat(context.request.parameters.custpage_width);
            log.debug({title: 'Width', details: itemWidth});
                    itemHeight = parseFloat(context.request.parameters.custpage_height);
            log.debug({title: 'Height', details: itemHeight});
                    itemWeight = parseFloat(context.request.parameters.custpage_weight);
            log.debug({title: 'Weight', details: itemWeight});
                    basePrice = parseFloat(context.request.parameters.custpage_baseprice);
            log.debug({title: 'Base Price', details: basePrice});
                    categoryField = context.request.parameters.custpage_category;
                    familyField = context.request.parameters.custpage_family;
            log.debug({title: 'Family Node', details: familyField});


                    if(fbaItem == 'T'){
                        fbaItem = true;
                    } else {
                        fbaItem = false;
                    }

                    if(bulkItem == 'T'){
                        bulkItem = true;
                    } else {
                        bulkItem = false;
                    }


                //create the new Item Record
                    var newItem = record.create({
                        type : record.Type.INVENTORY_ITEM,
                        isDynamic : false
                    });

                //Set the primary fields
                    newItem.setValue({fieldId: 'itemid', value: itemNumber});
                    newItem.setValue({fieldId: 'upccode', value: upcCode});
                    newItem.setValue({fieldId: 'displayname', value: description});
                    newItem.setValue({fieldId: 'purchasedescription', value: description});
                    newItem.setValue({fieldId: 'salesdescription', value: description});
                    newItem.setValue({fieldId: 'cost', value: purchasePrice});
                    newItem.setValue({fieldId: 'custitem_fa_amz_fba', value: fbaItem});
                    newItem.setValue({fieldId: 'custitem_bulk_item', value: bulkItem});
                    newItem.setValue({fieldId: 'custitemcountry_of_origin', value: countryOfOrigin});
                    newItem.setValue({fieldId: 'custitem_htscode', value: htsCode});
                    newItem.setValue({fieldId: 'custitemsku_dim_len', value: itemLength});
                    newItem.setValue({fieldId: 'custitemsku_dim_wid', value: itemWidth});
                    newItem.setValue({fieldId: 'custitemsku_dim_ht', value: itemHeight});
                    newItem.setValue({fieldId: 'weight', value: itemWeight});
                    newItem.setValue({fieldId: 'custitem_product_status', value: 3});


                //Set Merchandise Hierarchy
                    newItem.setSublistValue({sublistId: 'hierarchyversions', fieldId: 'hierarchyversion', line: 1, value: 2});
                    newItem.setSublistValue({sublistId: 'hierarchyversions', fieldId: 'hierarchynode', line: 1, value: familyField});
                    newItem.setSublistValue({sublistId: 'hierarchyversions', fieldId: 'isincluded', line: 1, value: true});

                    //Set Base Price and Pricing Worksheet Price
                    newItem.setSublistValue({sublistId: 'price1', fieldId: 'price_1_', line: 0, value: basePrice});
                    //newItem.setSublistValue({sublistId: 'price1', fieldId: 'price_1_', line: 10, value: basePrice});  //need to find a way to set Standard Price

                //Set Preferred Vendor
                    newItem.setSublistValue({sublistId: 'itemvendor', fieldId: 'vendor', line: 0, value: preferredVendor});
                    //newItem.setSublistValue({sublistId: 'itemvendor', fieldId: 'itemvendorprice', line: 0, value: purchasePrice});
                    newItem.setSublistValue({sublistId: 'itemvendor', fieldId: 'preferredvendor', line: 0, value: true});


            log.audit({title: 'Ready to Save'});

                //Save the Item Record
                    var newItemId = newItem.save();

                //Go to the new item Record
                    redirect.toRecord({
                        type: record.Type.INVENTORY_ITEM,
                        id: newItemId,
                        isEditMode: true
                    });

                }

            } catch (e) {
                log.error('onRequest', JSON.parse(JSON.stringify(e)));
            }
        }

        return {
            onRequest: onRequest,
        };

    }
);
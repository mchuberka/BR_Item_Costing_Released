/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

var serverWidget, search, log, costingLibrary;

define (['N/ui/serverWidget', 'N/search', 'N/log', './BR_LIB_Item_Costing'], main);

function main (serverWidgetModule, searchModule, logModule, itemCostingLibrary){

    serverWidget = serverWidgetModule;
    search = searchModule;
    log = logModule;
    costingLibrary = itemCostingLibrary;
    //historyRows = 100;

    return{

        onRequest: function(context){
            log.audit({title: 'Function Main Started'})

            //Create Form
            var form = serverWidget.createForm({
                title: 'Item Costing: SKU Evaluation',
                hideNavBar: false
            });
            log.debug({title: 'Create Form'});

            //Custom button to trigger calculation client script
            form.addButton({
                id: 'evaluate',
                label: 'Evaluate Costs',
                functionName: 'evaluateCosts'
            });

            //Custom button to reset original item values
            form.addButton({
                id: 'reset',
                label: 'Reset Item Values',
                functionName: 'resetValues'
            });

    //Create Groups and Fields for Input
        //Primary Information Group
        var primaryInformation = form.addFieldGroup({
            id: 'primaryinformationgroup',
            label: 'Primary Information'
        });
            //Item Number
            var item = form.addField({
                id: 'custpage_item',
                type: serverWidget.FieldType.SELECT,
                source: 'item',
                label: 'Item',
                container: 'primaryinformationgroup'
            });
                item.updateDisplaySize({
                    height: 60,
                    width: 15
                });
                item.setHelpText({
                    help : 'Select an item to evaluate.  Note: Only inventory items with costing records will be used.  You can check for a costing record by typing (Costing - and the item number) in the Global Search bar.'
                });

            //DisplayName
            var displayName = form.addField({
                id: 'custpage_displayname',
                type: serverWidget.FieldType.TEXT,
                label: 'Display Name',
                container: 'primaryinformationgroup'
            });
                displayName.setHelpText({
                    help : 'Displays the value from the item display name field.'
                });

            //Current Gross Margin
            var grossMarginAmt = form.addField({
                id: 'custpage_grossmarginamt',
                type: serverWidget.FieldType.FLOAT,
                label: 'Current Gross Margin',
                container: 'primaryinformationgroup'
            });
                grossMarginAmt.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                grossMarginAmt.updateBreakType({
                    breakType : serverWidget.FieldBreakType.STARTCOL
                });
                grossMarginAmt.setHelpText({
                    help : 'Displays the current calculated gross margin from the item costing system.'
                });

            //Current Gross Margin %
            var grossMarginPct = form.addField({
                id: 'custpage_grossmarginpct',
                type: serverWidget.FieldType.TEXT,
                label: 'Current Gross Margin %',
                container: 'primaryinformationgroup'
            });
                grossMarginPct.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                grossMarginPct.setHelpText({
                    help : 'Displays the current calculated gross margin percentage from the item costing system.'
                });

            //New Gross Margin
            var grossMarginAmtNew = form.addField({
                id: 'custpage_grossmarginamtnew',
                type: serverWidget.FieldType.FLOAT,
                label: 'NEW GROSS MARGIN',
                container: 'primaryinformationgroup'
            });
                grossMarginAmtNew.setHelpText({
                    help : 'After calculating the new values in this tool, displays the margin with the entered changes.  NOTE: This can take several seconds to calculate after submitting values.'
                });
                grossMarginAmtNew.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                grossMarginAmtNew.updateBreakType({
                    breakType : serverWidget.FieldBreakType.STARTCOL
                });

            //New Gross Margin %
            var grossMarginPctNew = form.addField({
                id: 'custpage_grossmarginpctnew',
                type: serverWidget.FieldType.TEXT,
                label: 'NEW GROSS MARGIN %',
                container: 'primaryinformationgroup'
            });
                grossMarginPctNew.setHelpText({
                    help : 'After calculating the new values in this tool, displays the margin percentage with the entered changes. NOTE: This can take several seconds to calculate after submitting values.'
                });
                grossMarginPctNew.updateDisplaySize({
                    height: 60,
                    width: 7
                });


        //Item Information Group
        var itemInformation = form.addFieldGroup({
            id: 'iteminformationgroup',
            label: 'Item Information'
        });
            //FBA (checkbox)
            var fbaItem = form.addField({
                id: 'custpage_fbaitem',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'FBA Item',
                container: 'iteminformationgroup'
            });
                fbaItem.setHelpText({
                    help : 'Loads from item record.  Check or uncheck to calculate margins as FBA vs. FBM.'
                });
            //Bulk (checkbox)
            var bulkItem = form.addField({
                id: 'custpage_bulkitem',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Bulk Item',
                container: 'iteminformationgroup'
            });
                bulkItem.setHelpText({
                    help : 'Loads from item record.  Check or uncheck to calculate margins as Bulk items.'
                });

            //Country of Origin
            var countryOfOrigin = form.addField({
                id: 'custpage_countryoforigin',
                type: serverWidget.FieldType.SELECT,
                label: 'Country of Origin',
                source: 'customlistcountry_list',
                container: 'iteminformationgroup'
            });
                countryOfOrigin.setHelpText({
                    help : 'Loads from item record.  Selecting a different country will change the ocean freight charges automatically.'
                });

            //Length
            var itemLength =  form.addField({
                id: 'custpage_itemlength',
                type: serverWidget.FieldType.FLOAT,
                label: 'Length',
                container: 'iteminformationgroup'
            });
                itemLength.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                itemLength.setHelpText({
                    help : 'Loads from item record.  Changing this value will recalculate the item CBM.  It will also change evaluation margins for ocean freight, transfers, storage, and shipping.'
                });
                itemLength.updateBreakType({
                    breakType : serverWidget.FieldBreakType.STARTCOL
                });

            //Width
            var itemWidth =  form.addField({
                id: 'custpage_itemwidth',
                type: serverWidget.FieldType.FLOAT,
                label: 'Width',
                container: 'iteminformationgroup'
            });
                itemWidth.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                itemWidth.setHelpText({
                    help : 'Loads from item record.  Changing this value will recalculate the item CBM.  It will also change evaluation margins for ocean freight, transfers, storage, and shipping.'
                });

            //Height
            var itemHeight =  form.addField({
                id: 'custpage_itemheight',
                type: serverWidget.FieldType.FLOAT,
                label: 'Height',
                container: 'iteminformationgroup'
            });
                itemHeight.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                itemHeight.setHelpText({
                    help : 'Loads from item record.  Changing this value will recalculate the item CBM.  It will also change evaluation margins for ocean freight, transfers, storage, and shipping.'
                });

            //Weight
            var itemWeight =  form.addField({
                id: 'custpage_itemweight',
                type: serverWidget.FieldType.FLOAT,
                label: 'Weight',
                container: 'iteminformationgroup'
            });
            itemWeight.updateDisplaySize({
                height: 60,
                width: 7
            });
            itemWeight.setHelpText({
                help : 'Loads from item record. Changing this value change evaluation margins for fulfillment shipping.'
            });
            itemWeight.updateBreakType({
                breakType : serverWidget.FieldBreakType.STARTCOL
            });

            //CBM
            var itemCBM = form.addField({
                id: 'custpage_itemcbm',
                type: serverWidget.FieldType.FLOAT,
                label: 'Item CBM',
                container: 'iteminformationgroup'
            });
            itemCBM.updateDisplaySize({
                height: 60,
                width: 10
            });

            //Container Used for Costing //todo? Let's see.


            //Pricing Group
            var pricing = form.addFieldGroup({
                id:'pricinggroup',
                label:'Pricing'
            });
            //Purchase Price
            var purchasePrice = form.addField({
                id: 'custpage_purchaseprice',
                type: serverWidget.FieldType.FLOAT,
                label: 'Purchase Price',
                container: 'pricinggroup'
            });
            purchasePrice.updateDisplaySize({
                height: 60,
                width: 7
            });
            purchasePrice.setHelpText({
                help : 'The purchase price of the item to be evaluated.'
            });
            //Sales Price Field
            var salesPrice = form.addField({
                id: 'custpage_salesprice',
                type: serverWidget.FieldType.FLOAT,
                label: 'Sales Price',
                container: 'pricinggroup'
            });
            salesPrice.updateDisplaySize({
                height: 60,
                width: 7
            });
            salesPrice.setHelpText({
                help : 'The sales price of the item to be evaluated.  NOTE: If the item record does not have a base price, this value is the purchase price.'
            });

        //Landed Costs Group
        var landedCost = form.addFieldGroup({
            id: 'landedcostgroup',
            label: 'Landed Costs'
        });

            //Tariff Percentage Field
            var tariffRatePct = form.addField({
                id: 'custpage_tariffratepct',
                type: serverWidget.FieldType.PERCENT,
                label: 'Tariff Rate %',
                container: 'landedcostgroup'
            });
            tariffRatePct.updateDisplaySize({
                height: 60,
                width: 7
            });
            tariffRatePct.setHelpText({
                help : "Enter a new Tariff Rate as a decimal value (no % sign) you want to evaluate."
            });

            //Ocean Lane Rate Field
            var seaFreightRate = form.addField({
                id: 'custpage_seafreightrate',
                type: serverWidget.FieldType.FLOAT,
                label: 'Ocean Lanes Rate (Door to Door)',
                container: 'landedcostgroup'
            });
            seaFreightRate.updateDisplaySize({
                height: 60,
                width: 7
            });
            seaFreightRate.setHelpText({
                help : "Enter the new Ocean Lane Rate amount that you want to evaluate."
            });


        //Fulfillment Costs Group
        var fulfillmentCost = form.addFieldGroup({
            id: 'fulfillmentcostgroup',
            label: 'Fulfillment Costs'
        });

            //FBM Shipping Cost Percentage Change
            var fbmShipRateChange = form.addField({
                id: 'custpage_fbmshipratechange',
                type: serverWidget.FieldType.FLOAT,
                label: 'FBM Shipping Rate % Change',
                container: 'fulfillmentcostgroup'
            });
                fbmShipRateChange.defaultValue = '0';
                fbmShipRateChange.updateDisplaySize({
                    height: 60,
                    width: 7
                });
            fbmShipRateChange.setHelpText({
                help : "Enter the increase or decrease of the FBM Shipping Costs as a percentage you want to evaluate.  For example, a 5 percent increase would be entered as 5."
            });

            //FBM Shipping Additional Amount
            var fbmShipAdditionalAmt = form.addField({
                id: 'custpage_fbmshipaddlamt',
                type: serverWidget.FieldType.FLOAT,
                label: 'FBM Shipping Rate Additional Amt',
                container: 'fulfillmentcostgroup'
            });
                fbmShipAdditionalAmt.defaultValue = '0';
                fbmShipAdditionalAmt.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                fbmShipAdditionalAmt.setHelpText({
                    help : "Enter any dollar amount, positive (or negative) that you want to evaluate. Do not include the $ sign."
                });

            //FBA Fulfillment Cost Percentage Change
            var fbaFulfillmentChange = form.addField({
                id: 'custpage_fbafulfillmentchange',
                type: serverWidget.FieldType.FLOAT,
                label: 'FBA Fulfillment Rate % Change',
                container: 'fulfillmentcostgroup'
            });
                fbaFulfillmentChange.defaultValue = '0';
                fbaFulfillmentChange.updateDisplaySize({
                    height: 60,
                    width: 7
                });

            fbaFulfillmentChange.setHelpText({
                help : "Enter the increase or decrease of the FBA Fulfillment Fees as a decimal you want to evaluate.  For example, a 5 percent decrease would be entered as -5."
            });

            fbaFulfillmentChange.updateBreakType({
                breakType : serverWidget.FieldBreakType.STARTCOL
            });

            //FBA Fulfillment Additional Amount
            var fbaShipAdditionalAmt = form.addField({
                id: 'custpage_fbashipaddlamt',
                type: serverWidget.FieldType.FLOAT,
                label: 'FBA Shipping Rate Additional Amt',
                container: 'fulfillmentcostgroup'
            });
                fbaShipAdditionalAmt.defaultValue = '0';
                fbaShipAdditionalAmt.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                fbaShipAdditionalAmt.setHelpText({
                    help : 'Enter any dollar amount, positive (or negative) that you want to evaluate. Do not include the $ sign.'
                });

        //Selling Costs Group
        var sellingCost = form.addFieldGroup({
            id: 'sellingcostgroup',
            label: 'Selling Costs'
        });

            //Refund Rate Adjustment
            var refundRate = form.addField({
                id: 'custpage_refundrate',
                type: serverWidget.FieldType.PERCENT,
                label: 'Default Refund Rate',
                container: 'sellingcostgroup'
            });
                refundRate.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                refundRate.setHelpText({
                    help : "Diplayed from global default values.  Enter the increase or decrease of the Return Rate as a decimal you want to evaluate.  For example, a 5 percent decrease would be entered as -5."
                });

            //call client script to populate values.
            form.clientScriptModulePath = './BR_CS_Costing_Lookup.js';

            //display the form
            context.response.writePage(form);
        }

    }
}



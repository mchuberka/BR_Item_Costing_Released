/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

var serverWidget, query, log;

define (['N/ui/serverWidget', 'N/query', 'N/log', 'N/runtime', 'N/file'], main);

function main (serverWidgetModule, queryModule, logModule, runtimeModule, fileModule){

    serverWidget = serverWidgetModule;
    query = queryModule;
    log = logModule;
    //historyRows = 100;

    return{

        onRequest: function(context){
            log.audit({title: 'Function Main Started'})

/*            var userId = runtimeModule.getCurrentUser().id;
            var userEmail = runtimeModule.getCurrentUser().email;

            logModule.debug({title: 'User ID', details: userId});
            logModule.debug({title: 'User Email', details: userEmail});*/

    //Create Form
            var form = serverWidget.createForm({
                title: 'Item Costing: Global Modifiers',
                hideNavBar: false
            });
            log.debug({title: 'Create Form'});

            form.addSubmitButton({label: 'Submit'});

    //Create Groups and Fields for Input

        //Pricing Group
            var pricing = form.addFieldGroup({
                id:'pricinggroup',
                label:'Pricing'
            });
            //Purchase Price Change Field
            var purchaseRateChange = form.addField({
                id: 'custpage_purchaseratechange',
                type: serverWidget.FieldType.FLOAT,
                label: 'Purchase Price Rate % Change',
                container: 'pricinggroup'
            });
            purchaseRateChange.defaultValue = '0';
            purchaseRateChange.updateDisplaySize({
                height: 60,
                width: 7
            });
            purchaseRateChange.setHelpText({
                help : "Enter the increase or decrease of the Purchase Price as a percentage you want to evaluate.  For example, a 5 percent increase would be entered as 5."
            });
            //Sell Price Change Field
            var sellRateChange = form.addField({
                id: 'custpage_sellratechange',
                type: serverWidget.FieldType.FLOAT,
                label: 'Sales Price Rate % Change',
                container: 'pricinggroup'
            });
            sellRateChange.defaultValue = '0';
            sellRateChange.updateDisplaySize({
                height: 60,
                width: 7
            });
            sellRateChange.setHelpText({
                help : "Enter the increase or decrease of the Sales Price as a percentage you want to evaluate.  For example, a 5 percent decrease would be entered as -5."
            });

        //Landed Costs Group
            var landedCost = form.addFieldGroup({
                id: 'landedcostgroup',
                label: 'Landed Costs'
            });
            //Tariff Rate Change Field
            var tariffRateChange = form.addField({
                id: 'custpage_tariffratechange',
                type: serverWidget.FieldType.FLOAT,
                label: 'Tariff Rate % Change',
                container: 'landedcostgroup'
            });
                tariffRateChange.defaultValue = '0';
                tariffRateChange.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                tariffRateChange.setHelpText({
                    help : "Enter the increase or decrease of the Tariff Rates as a percentage you want to evaluate.  For example, a 5 percent increase would be entered as 5."
                });
            //Ocean Lane Change Field
            var seaFreightChange = form.addField({
                id: 'custpage_seafreightchange',
                type: serverWidget.FieldType.FLOAT,
                label: 'Ocean Lanes Rate % Change',
                container: 'landedcostgroup'
            });
                seaFreightChange.defaultValue = '0';
                seaFreightChange.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                seaFreightChange.setHelpText({
                    help : "Enter the increase or decrease of the Ocean Lane Rates as a percentage you want to evaluate.  For example, a 5 percent decrease would be entered as -5."
                });

        //Transfer Costs Group
            var transferCost = form.addFieldGroup({
                id: 'transfercostgroup',
                label: 'Transfer Costs'
            });
            //Transfer Lane Change Field
            var transferLaneChange = form.addField({
                id: 'custpage_transferlanechange',
                type: serverWidget.FieldType.FLOAT,
                label: 'Transfer Lanes Rate % Change',
                container: 'transfercostgroup'
            });
                transferLaneChange.defaultValue = '0';
                transferLaneChange.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                transferLaneChange.setHelpText({
                    help : "Enter the increase or decrease of the Transfer Lanes Rates as a percentage you want to evaluate.  For example, a 5 percent decrease would be entered as -5."
                });

        //Storage Costs Group
            var storageCost = form.addFieldGroup({
                id: 'storagecostgroup',
                label: 'Storage Costs'
            });

            //FBA Storage Cost Field
            var fbaStorageChange = form.addField({
                id: 'custpage_fbastoragechange',
                type: serverWidget.FieldType.FLOAT,
                label: 'FBA Storage Rate % Change',
                container: 'storagecostgroup'
            });
                fbaStorageChange.defaultValue = '0';
                fbaStorageChange.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                fbaStorageChange.setHelpText({
                    help : "Enter the increase or decrease of the FBA Storage Fees as a percentage you want to evaluate.  For example, a 5 percent increase would be entered as 5."
                });

        //Fulfillment Costs Group
            var fulfillmentCost = form.addFieldGroup({
                id: 'fulfillmentcostgroup',
                label: 'Fulfillment Costs'
            });

            //FBM Shipping Cost Field
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

            //FBA Fulfillment Cost Field
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
                    help : "Enter the increase or decrease of the FBA Fulfillment Fees as a percentage you want to evaluate.  For example, a 5 percent decrease would be entered as -5."
                });


        //Sold Costs Group
            var soldCost = form.addFieldGroup({
                id: 'soldcostgroup',
                label: 'Sold Costs'
            });
            //Sales Commissions Field
            var salesCommission = form.addField({
                id: 'custpage_salescommission',
                type: serverWidget.FieldType.FLOAT,
                label: 'Sales Commission % Change',
                container: 'soldcostgroup'
            });
                salesCommission.defaultValue = '0';
                salesCommission.updateDisplaySize({
                    height: 60,
                    width: 7
                });
                salesCommission.setHelpText({
                    help : "Enter the increase or decrease of the MarketPlace Commission as a percentage you want to evaluate.  For example, a 2 percent increase would be entered as 2."
                });


//************************************************
            // If the form has been submitted...

            if (context.request.method == 'POST'){
        log.audit({title: 'Post Received'});
                //set defaults for field values
                purchaseRateChange.defaultValue = context.request.parameters.custpage_purchaseratechange;
                sellRateChange.defaultValue = context.request.parameters.custpage_sellratechange;
                tariffRateChange.defaultValue = context.request.parameters.custpage_tariffratechange;
                seaFreightChange.defaultValue = context.request.parameters.custpage_seafreightchange;
                transferLaneChange.defaultValue = context.request.parameters.custpage_transferlanechange;
                fbaStorageChange.defaultValue = context.request.parameters.custpage_fbastoragechange;
                fbaFulfillmentChange.defaultValue = context.request.parameters.custpage_fbafulfillmentchange;
                fbmShipRateChange.defaultValue = context.request.parameters.custpage_fbmshipratechange;
                salesCommission.defaultValue = context.request.parameters.custpage_salescommission;


                //TEST
                var fileObj = fileModule.create({
                    name: 'testHelloWorld3.txt',
                    fileType: fileModule.Type.PLAINTEXT,
                    contents: 'Hello World\nHello World',
                    folder: 94578,
                    isOnline: true
                });
                // Save the file
                var id = fileObj.save();

            //process the form (this is the new function below)
            formProcess(context, form);

            }

            //display the form
            context.response.writePage( form );
        }

    }


}

function formProcess (context, form){
    log.audit({title: 'formProcess Started'});

    // Calculate percentage change modifiers for inputted changes
    var purchasePricePct = parseFloat((context.request.parameters.custpage_purchaseratechange)/100)+1;
    var sellPricePct = parseFloat((context.request.parameters.custpage_sellratechange)/100)+1;
    var tariffPct = parseFloat((context.request.parameters.custpage_tariffratechange)/100)+1;
    var seaFreightPct = parseFloat((context.request.parameters.custpage_seafreightchange)/100)+1;
    var transferPct = parseFloat((context.request.parameters.custpage_transferlanechange)/100)+1;
    var fbaStoragePct = parseFloat((context.request.parameters.custpage_fbastoragechange)/100)+1;
    var fbaFulfillmentPct = parseFloat((context.request.parameters.custpage_fbafulfillmentchange)/100)+1;
    var fbmShipRatePct = parseFloat((context.request.parameters.custpage_fbmshipratechange)/100)+1;
    var salesCommPct = parseFloat((context.request.parameters.custpage_salescommission)/100)+1;  //todo new percentage value instead?


    var theQuery = '';
//FBM
    theQuery += 'SELECT ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item) AS item, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item_description) AS description, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_product_status) AS product_status, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_primary_class) AS primary, ';
        //original_gross_margin
    theQuery += 'custrecord_br_cst1_gross_margin AS orig_gross_margin, ';
        //new_gross_margin
    theQuery += 'ROUND((custrecord_br_cst1_item_base_price *\'' + sellPricePct + '\') - ((custrecord_br_cst1_item_purchase_price *\'' + purchasePricePct + '\') + (custrecord_br_cst1_total_tariff *\'' + tariffPct + '\') + (custrecord_br_cst1_total_sea_freight *\'' + seaFreightPct + '\') + custrecord_br_cst1_total_sourcing + (custrecord_br_cst1_wgt_transfr_cost_fbm *\'' + transferPct + '\') + custrecord_br_cst1_fbm_picking_cost + (custrecord_br_cst1_total_delvd_costs_fbm *\'' + fbmShipRatePct + '\') + (custrecord_br_cst1_salecomm_pct_amt_fbm *\'' + salesCommPct + '\') + custrecord_br_cst1_refund_total_fbm + custrecord_br_cst1_fixed_overhead_amount),2) AS new_gross_margin, ';
        //sell price change
    theQuery += 'custrecord_br_cst1_item_purchase_price AS orig_purchase_price, ';
    theQuery += 'ROUND((custrecord_br_cst1_item_purchase_price *\'' + purchasePricePct + '\'),2)  AS new_purchase_price, ';
        //purchase price change
    theQuery += 'custrecord_br_cst1_item_base_price AS orig_sell_price, ';
    theQuery += 'ROUND((custrecord_br_cst1_item_base_price *\'' + sellPricePct + '\'),2) AS new_sell_price, ';
        //tariff_change
    theQuery += 'ROUND((custrecord_br_cst1_total_tariff *\'' + tariffPct + '\'),2) - custrecord_br_cst1_total_tariff AS tariff_change , ';
        //sea freight change
    theQuery += 'ROUND((custrecord_br_cst1_total_sea_freight *\'' + seaFreightPct + '\'),2) - custrecord_br_cst1_total_sea_freight AS sea_freight_change, ';
        //transfer rate change
    theQuery += 'ROUND((custrecord_br_cst1_wgt_transfr_cost_fbm *\'' + transferPct + '\'),2) - custrecord_br_cst1_wgt_transfr_cost_fbm AS transfer_rate_change, ';
        //storage rate change
    theQuery += '0 AS storage_rate_change, '; //fbm
        //fulfillment change
    theQuery += 'ROUND((custrecord_br_cst1_total_delvd_costs_fbm *\'' + fbmShipRatePct + '\'),2) - custrecord_br_cst1_total_delvd_costs_fbm AS fulfillment_change, '; //fbm
        //sold cost change
    theQuery += 'ROUND((custrecord_br_cst1_salecomm_pct_amt_fbm *\'' + salesCommPct + '\'),2) - custrecord_br_cst1_salecomm_pct_amt_fbm AS commission_change, ';

    theQuery += 'FROM ';
    theQuery += 'customrecord_br_item_MASTER_CST1 ';

    theQuery += 'WHERE ';
    theQuery += 'isinactive = \'F\' ';
    theQuery += 'AND ';
    theQuery += '(custrecord_br_cst1_fba = \'F\') ';
    theQuery += 'AND ';
    theQuery += '(custrecord_br_cst1_bulk_item =\'F\') ';

    theQuery += 'UNION ';
    
//FBA
    theQuery += 'SELECT ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item) AS item, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item_description) AS description, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_product_status) AS product_status, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_primary_class) AS primary, ';
    theQuery += 'custrecord_br_cst1_gross_margin AS orig_gross_margin,';
    theQuery += 'ROUND ((custrecord_br_cst1_item_base_price *\'' + sellPricePct + '\') - ((custrecord_br_cst1_item_purchase_price *\'' + purchasePricePct + '\') + (custrecord_br_cst1_total_tariff *\'' + tariffPct + '\') + (custrecord_br_cst1_total_sea_freight *\'' + seaFreightPct + '\') + custrecord_br_cst1_total_sourcing + (custrecord_br_cst1_wgt_transfr_cost_fba *\'' + transferPct + '\') + (custrecord_br_cst1_fba_storage_cost *\'' + fbaStoragePct + '\') + (custrecord_br_cst1_fba_total_fulfill *\'' + fbaFulfillmentPct + '\') + (custrecord_br_cst1_salecomm_pct_amt_fba *\'' + salesCommPct + '\') + custrecord_br_cst1_refund_total_fba + custrecord_br_cst1_fixed_overhead_amount),2) AS new_gross_margin,';
    theQuery += 'custrecord_br_cst1_item_purchase_price AS orig_purchase_price, ';
    theQuery += 'ROUND((custrecord_br_cst1_item_purchase_price *\'' + purchasePricePct + '\'),2)  AS new_purchase_price, ';
    theQuery += 'custrecord_br_cst1_item_base_price AS orig_sell_price, ';
    theQuery += 'ROUND((custrecord_br_cst1_item_base_price *\'' + sellPricePct + '\'),2) AS new_sell_price, ';
    theQuery += 'ROUND((custrecord_br_cst1_total_tariff *\'' + tariffPct + '\'),2) - custrecord_br_cst1_total_tariff AS tariff_change ,';
    theQuery += 'ROUND((custrecord_br_cst1_total_sea_freight *\'' + seaFreightPct + '\'),2) - custrecord_br_cst1_total_sea_freight AS sea_freight_change,';
    theQuery += 'ROUND((custrecord_br_cst1_wgt_transfr_cost_fba *\'' + transferPct + '\'),2) - custrecord_br_cst1_wgt_transfr_cost_fba AS transfer_rate_change,';
    theQuery += 'ROUND((custrecord_br_cst1_fba_storage_cost *\'' + fbaStoragePct + '\'),2) - custrecord_br_cst1_fba_storage_cost AS storage_rate_change,';
    theQuery += 'ROUND((custrecord_br_cst1_fba_total_fulfill *\'' + fbaFulfillmentPct + '\'),2) - custrecord_br_cst1_fba_total_fulfill AS fulfillment_change,';
    theQuery += 'ROUND((custrecord_br_cst1_salecomm_pct_amt_fba *\'' + salesCommPct + '\'),2) - custrecord_br_cst1_salecomm_pct_amt_fba AS commission_change,';

    theQuery += 'FROM ';
    theQuery += 'customrecord_br_item_MASTER_CST1 ';

    theQuery += 'WHERE ';
    theQuery += 'isinactive = \'F\' ';
    theQuery += 'AND ';
    theQuery += '(custrecord_br_cst1_fba = \'T\') ';

    theQuery += 'UNION ';

//BULK
    theQuery += 'SELECT ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item) AS item, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item_description) AS description, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_product_status) AS product_status, ';
    theQuery += 'BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_primary_class) AS primary, ';
    theQuery += 'custrecord_br_cst1_gross_margin AS orig_gross_margin,';
    theQuery += 'ROUND((custrecord_br_cst1_item_base_price *\'' + sellPricePct + '\') - ((custrecord_br_cst1_item_purchase_price *\'' + purchasePricePct + '\') + custrecord_br_cst1_total_sourcing + (custrecord_br_cst1_salecomm_pct_amt_blk *\'' + salesCommPct + '\') + custrecord_br_cst1_refund_total_bulk + custrecord_br_cst1_fixed_overhead_amount),2) AS new_gross_margin, ';
    theQuery += 'custrecord_br_cst1_item_purchase_price AS orig_purchase_price, ';
    theQuery += 'ROUND((custrecord_br_cst1_item_purchase_price *\'' + purchasePricePct + '\'),2)  AS new_purchase_price, ';
    theQuery += 'custrecord_br_cst1_item_base_price AS orig_sell_price, ';
    theQuery += 'ROUND((custrecord_br_cst1_item_base_price *\'' + sellPricePct + '\'),2) AS new_sell_price, ';
    theQuery += '0 AS tariff_change ,';
    theQuery += '0 AS sea_freight_change,';
    theQuery += '0 AS transfer_rate_change,';
    theQuery += '0 storage_rate_change,';
    theQuery += '0 AS fulfillment_change,';
    theQuery += 'ROUND((custrecord_br_cst1_salecomm_pct_amt_blk *\'' + salesCommPct + '\'),2) - custrecord_br_cst1_salecomm_pct_amt_blk AS commission_change,';

    theQuery += 'FROM ';
    theQuery += 'customrecord_br_item_MASTER_CST1 ';

    theQuery += 'WHERE ';
    theQuery += 'isinactive = \'F\' ';
    theQuery += 'AND ';
    theQuery += '(custrecord_br_cst1_bulk_item = \'T\') ';

    // theQuery += 'ORDER BY ';
    // theQuery += 'item DESC ';


    try {
        // Run the query
        var queryResults = query.runSuiteQL(
            {
                query: theQuery
            }
        );
        log.audit({title: 'query ran'});


        //get the mapped results
        var records = queryResults.asMappedResults();

        //if records were returned
        if (records.length > 0) {
            log.audit({title: 'Records Returned', details: records.length});

            // Create a sublist for the results.
            var resultsSublist = form.addSublist(
                {
                    id: 'results_sublist',
                    label: 'Item Costing',
                    type: serverWidget.SublistType.LIST
                }
            );


            // Get the column names.
            var columnNames = Object.keys(records[0]);

            // Loop over the column names...
            for (i = 0; i < columnNames.length; i++) {

                // Add the column to the sublist as a field.
                resultsSublist.addField(
                    {
                        id: 'custpage_results_sublist_col_' + i,
                        type: serverWidget.FieldType.TEXT,
                        label: columnNames[i]
                    }
                );

            }

            // Add the records to the sublist...
            for (r = 0; r < records.length; r++) {

                // Get the record.
                var record = records[r];

                // Loop over the columns...
                for (c = 0; c < columnNames.length; c++) {

                    // Get the column name.
                    var column = columnNames[c];

                    // Get the column value.
                    var value = record[column];

                    // If the column has a value...
                    if (value != null) {

                        // Get the value as a string.
                        value = value.toString();

                        // If the value is too long to be displayed in the sublist...
                        if (value.length > 300) {

                            // Truncate the value.
                            value = value.substring(0, 297) + '...';

                        }

                        // Add the column value.
                        resultsSublist.setSublistValue(
                            {
                                id: 'custpage_results_sublist_col_' + c,
                                line: r,
                                value: value
                            }
                        );

                    }

                }

            }

        // Save Results (N/file)
/*            //TEST
            let fileObj = file.create({
                name: 'testHelloWorld3.txt',
                fileType: file.Type.PLAINTEXT,
                contents: 'Hello World\nHello World',
                folder: 94578,
                isOnline: true
            });
            // Save the file
            let id = fileObj.save();*/


/*            var savedResults = fileModule.create({
                //name: 'WhatIF_Global-' + userId + '.csv',
                name: 'WhatIF_Global-test.csv',
                fileType: fileModule.Type.CSV,
                contents: records,
                //encoding: fileModule.Encoding.UTF8,
                //description: 'WhatIf Global Query for UserID ' + userId
                //description: 'WhatIf Global Query for UserID TEST'
            });
            fileModule.folder = 94578;
            var fileId = savedResults.save();*/

            //EMAIL RESULTS
            //add sublist button for email results ;  Have it call new function for file create/email
            /*
                        resultsSublist.addButton({
                            id:' exportCSV',
                            label: 'Email Results'
                            //add call link to CS
                        });
            */



    } else {

            // Add an "Error" field.
            var errorField = form.addField(
                {
                    id: 'custpage_field_error',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Error'
                }
            );

            errorField.defaultValue = 'No values found for: ' + context.request.parameters.custpage_field_itemid;
        }

    } catch (e) {
        var errorField = form.addField(
            {
                id: 'custpage_field_error',
                type: serverWidget.FieldType.LONGTEXT,
                label: 'Error'
            }
        );
        errorField.defaultValue = e.message;

    }

}



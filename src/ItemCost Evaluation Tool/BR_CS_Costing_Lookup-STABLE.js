/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

define(['N/search', 'N/currentRecord', './BR_LIB_Item_Costing'],
    function(searchModule,currentRecord, itemCostingLibrary) {
    var rec = currentRecord.get();
        var fbaWeight = 0;
        var fbmWeight = 0;
        var shippingAHWeight = 0;


    function pageInit(context) {
        //Pull default values and write to field
        var defaultValues = searchModule.create({
            type: 'customrecord_br_item_costing_defaults',
            filters: [
                ['isinactive', 'is', 'F']
            ],
            columns: [
                searchModule.createColumn({name: 'custrecord_br_costdef_refund_pct'})
            ]
        });
        //Then substitute it into the POST calculation script
        var defaultRun = defaultValues.run();

        var defaultResult = defaultRun.getRange({
            start: 0,
            end: 1
        }) [0];
        var refundDefault = parseFloat(defaultResult.getValue({name: 'custrecord_br_costdef_refund_pct'}));

        rec.setValue({fieldId:'custpage_refundrate', value: refundDefault});
    }

        function fieldChanged(context) {
            if(context.fieldId == 'custpage_item') {
                var item = rec.getValue('custpage_item');

                if(item == '') return;

                var costingSearch = searchModule.create({
                    type: 'customrecord_br_item_master_cst1',
                    filters: [      
                        ['isinactive','is','F'],
                        'AND',
                        ['custrecord_br_cst1_item','anyof', item]
                    ],
                    columns: [
                        searchModule.createColumn({name: 'internalid'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_description'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_fba'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_bulk_item'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_length'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_width'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_height'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_weight'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_gross_margin'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_gross_margin_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_purchase_price'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_base_price'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_tariff_percentage'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_country_of_origin'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_cbm'}),
                    ]
                });

                var itemResults = costingSearch.run();
                var costingFirstResult = itemResults.getRange({
                    start: 0,
                    end: 1
                }) [0];

                var displayName = costingFirstResult.getValue({name: 'custrecord_br_cst1_item_description'});
                var fba = costingFirstResult.getValue({name: 'custrecord_br_cst1_fba'});
                var bulk = costingFirstResult.getValue({name: 'custrecord_br_cst1_bulk_item'});
                var length = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_length'}));
                var width = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_width'}));
                var height = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_height'}));
                var weight = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_weight'}));
                var grossMarginAmt = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_gross_margin'}));
                var grossMarginPct = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_gross_margin_pct'}));
                    if(!grossMarginPct){
                        grossMarginPct = 0;
                    }
                var purchasePrice = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_purchase_price'}));
                var basePrice = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_base_price'}));
                    if(!basePrice){
                        basePrice = purchasePrice;
                    }
                var tariffPct = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_tariff_percentage'}));
                var country = costingFirstResult.getValue({name: 'custrecord_br_cst1_country_of_origin'});
                var itemCBM = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_cbm'}));

                //if margin % is negative, NetSuite throws an error.  For display, this converts it to a string and formats.
                var grossPctString = '';
                if(grossMarginPct < 0){
                    grossMarginPct = Math.abs(grossMarginPct);
                    grossPctString = '(';
                        grossPctString += grossMarginPct.toString();
                        grossPctString += '%)';
                } else {
                    grossPctString = grossMarginPct.toString();
                    grossPctString += '%';
                }
                
                rec.setValue({fieldId: 'custpage_displayname', value: displayName});
                rec.setValue({fieldId: 'custpage_fbaitem', value: fba});
                rec.setValue({fieldId: 'custpage_bulkitem', value: bulk});
                rec.setValue({fieldId: 'custpage_itemlength', value: length, ignoreFieldChange: true});
                rec.setValue({fieldId: 'custpage_itemwidth', value: width, ignoreFieldChange: true});
                rec.setValue({fieldId: 'custpage_itemheight', value: height, ignoreFieldChange: true});
                rec.setValue({fieldId: 'custpage_itemweight', value: weight});
                rec.setValue({fieldId: 'custpage_grossmarginamt', value: grossMarginAmt});
                rec.setValue({fieldId: 'custpage_grossmarginpct', value: grossPctString});
                rec.setValue({fieldId: 'custpage_purchaseprice', value: purchasePrice});
                rec.setValue({fieldId: 'custpage_salesprice', value: basePrice});
                rec.setValue({fieldId: 'custpage_tariffratepct', value: tariffPct});
                rec.setValue({fieldId: 'custpage_countryoforigin', value: country});
                rec.setValue({fieldId: 'custpage_itemcbm', value: itemCBM});
                rec.setValue({fieldId: 'custpage_grossmarginamtnew', value: 0});
                rec.setValue({fieldId: 'custpage_grossmarginpctnew', value: 0});
            }


            //Field change for Length
            if(context.fieldId == 'custpage_itemlength') {
                var newLength = rec.getValue('custpage_itemlength');
                var newWidth = rec.getValue('custpage_itemwidth');
                var newHeight = rec.getValue('custpage_itemheight');

                //if (newLength == '' || newWidth == '' || newHeight == '') return;

                //Calculate cbm if values are changed
                var cbmCalculated = (Math.round((newLength * 2.54), 2) / 100) * (Math.round((newWidth * 2.54), 2) / 100) * (Math.round((newHeight * 2.54), 2) / 100);
                rec.setValue({fieldId: 'custpage_itemcbm', value: cbmCalculated});
            }
            //Field change for Width
            if(context.fieldId == 'custpage_itemwidth' ) {
                var newLength = rec.getValue('custpage_itemlength');
                var newWidth = rec.getValue('custpage_itemwidth');
                var newHeight = rec.getValue('custpage_itemheight');

                //if (newLength == '' || newWidth == '' || newHeight == '') return;

                var cbmCalculated = (Math.round((newLength * 2.54), 2) / 100) * (Math.round((newWidth * 2.54), 2) / 100) * (Math.round((newHeight * 2.54), 2) / 100);
                rec.setValue({fieldId: 'custpage_itemcbm', value: cbmCalculated});
            }
            //Field change for Height
            if(context.fieldId == 'custpage_itemheight' ) {
                var newLength = rec.getValue('custpage_itemlength');
                var newWidth = rec.getValue('custpage_itemwidth');
                var newHeight = rec.getValue('custpage_itemheight');

                //if (newLength == '' || newWidth == '' || newHeight == '') return;

                var cbmCalculated = (Math.round((newLength * 2.54), 2) / 100) * (Math.round((newWidth * 2.54), 2) / 100) * (Math.round((newHeight * 2.54), 2) / 100);
                rec.setValue({fieldId: 'custpage_itemcbm', value: cbmCalculated});
            }

            //Field change for Country of Origin - get Sea Freight Values
            if(context.fieldId == 'custpage_countryoforigin') {
                var countryOfOrigin = rec.getValue('custpage_countryoforigin');

                var oceanLaneSearch = searchModule.create({
                    type: 'customrecord_br_sea_freight',
                    filters: [
                        ['isinactive','is','F'],
                        'AND',
                        ['custrecord_br_sea_freight_country','anyof', countryOfOrigin]
                    ],
                    columns: [
                        searchModule.createColumn({name: 'custrecord_br_sea_freight_lane_cost'}),
                        //searchModule.createColumn({name: 'custrecord_br_sea_freight_usable_cbm'}),
                        //searchModule.createColumn({name: 'custrecord_br_sea_freight_cost_per_cbm'}) //todo need?
                    ]
                });
                var seaFreightResults = oceanLaneSearch.run();
                var seaFreightFirstResult = seaFreightResults.getRange({
                    start: 0,
                    end: 1
                }) [0];
                var laneCost = parseFloat(seaFreightFirstResult.getValue({name: 'custrecord_br_sea_freight_lane_cost'}));
                //var usableCBM = parseFloat(seaFreightFirstResult.getValue({name: 'custrecord_br_sea_freight_usable_cbm'}));
                //var costPerCBM = parseFloat(seaFreightFirstResult.getValue({name: 'custrecord_br_sea_freight_cost_per_cbm'}));

                rec.setValue({fieldId: 'custpage_seafreightrate', value: laneCost});
            }

        }

//*******************************************************
//*******************************************************
//************   RESET FIELD VALUES SCRIPT  *************
//*******************************************************
//*******************************************************
        function resetValues(){

            try{
                console.log('Function: resetValues Started');

                //Reload Default Refund Rate
                var defaultValues = searchModule.create({
                    type: 'customrecord_br_item_costing_defaults',
                    filters: [
                        ['isinactive', 'is', 'F']
                    ],
                    columns: [
                        searchModule.createColumn({name: 'custrecord_br_costdef_refund_pct'})
                    ]
                });
                //Then substitute it into the POST calculation script
                var defaultRun = defaultValues.run();

                var defaultResult = defaultRun.getRange({
                    start: 0,
                    end: 1
                }) [0];
                var refundDefault = parseFloat(defaultResult.getValue({name: 'custrecord_br_costdef_refund_pct'}));

                rec.setValue({fieldId:'custpage_refundrate', value: refundDefault});

               //Reload Item Values
                var item = rec.getValue('custpage_item');

                if(item == '') return;

                var costingSearch = searchModule.create({
                    type: 'customrecord_br_item_master_cst1',
                    filters: [
                        ['isinactive','is','F'],
                        'AND',
                        ['custrecord_br_cst1_item','anyof', item]
                    ],
                    columns: [
                        searchModule.createColumn({name: 'internalid'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_description'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_fba'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_bulk_item'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_length'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_width'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_height'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_weight'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_gross_margin'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_gross_margin_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_purchase_price'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_base_price'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_tariff_percentage'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_country_of_origin'}),
                        searchModule.createColumn({name: 'custrecord_br_cst1_item_cbm'}),
                    ]
                });
console.log('Search Run');
                var itemResults = costingSearch.run();
                var costingFirstResult = itemResults.getRange({
                    start: 0,
                    end: 1
                }) [0];

                var displayName = costingFirstResult.getValue({name: 'custrecord_br_cst1_item_description'});
                var fba = costingFirstResult.getValue({name: 'custrecord_br_cst1_fba'});
                var bulk = costingFirstResult.getValue({name: 'custrecord_br_cst1_bulk_item'});
                var length = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_length'}));
                var width = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_width'}));
                var height = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_height'}));
                var weight = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_weight'}));
                var grossMarginAmt = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_gross_margin'}));
                var grossMarginPct = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_gross_margin_pct'}));
                    if (!grossMarginPct){
                        grossMarginPct = 0;
                    }
                var purchasePrice = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_purchase_price'}));
                var tariffPct = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_tariff_percentage'}));
                var country = costingFirstResult.getValue({name: 'custrecord_br_cst1_country_of_origin'});
                var itemCBM = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_cbm'}));
                var basePrice = parseFloat(costingFirstResult.getValue({name: 'custrecord_br_cst1_item_base_price'}));
                    if (!basePrice){
                        basePrice = 0;
                    }

                //if margin % is negative, NetSuite throws an error.  For display, this converts it to a string and formats.
                var grossPctString = '';
                if(grossMarginPct < 0){
                    grossMarginPct = Math.abs(grossMarginPct);
                    grossPctString = '(';
                    grossPctString += grossMarginPct.toString();
                    grossPctString += '%)';
                } else {
                    grossPctString = grossMarginPct.toString();
                    grossPctString += '%';
                }

                rec.setValue({fieldId: 'custpage_displayname', value: displayName});
                rec.setValue({fieldId: 'custpage_fbaitem', value: fba});
                rec.setValue({fieldId: 'custpage_bulkitem', value: bulk});
                rec.setValue({fieldId: 'custpage_itemlength', value: length, ignoreFieldChange: true});
                rec.setValue({fieldId: 'custpage_itemwidth', value: width, ignoreFieldChange: true});
                rec.setValue({fieldId: 'custpage_itemheight', value: height, ignoreFieldChange: true});
                rec.setValue({fieldId: 'custpage_itemweight', value: weight});
                rec.setValue({fieldId: 'custpage_grossmarginamt', value: grossMarginAmt});
                rec.setValue({fieldId: 'custpage_grossmarginpct', value: grossPctString});
                rec.setValue({fieldId: 'custpage_purchaseprice', value: purchasePrice});
                rec.setValue({fieldId: 'custpage_tariffratepct', value: tariffPct});
                rec.setValue({fieldId: 'custpage_countryoforigin', value: country});
                rec.setValue({fieldId: 'custpage_itemcbm', value: itemCBM});
                rec.setValue({fieldId: 'custpage_grossmarginamtnew', value: 0});
                rec.setValue({fieldId: 'custpage_grossmarginpctnew', value: 0});
                rec.setValue({fieldId: 'custpage_fbmshipratechange', value: 0});
                rec.setValue({fieldId: 'custpage_fbmshipaddlamt', value: 0});
                rec.setValue({fieldId: 'custpage_fbafulfillmentchange', value: 0});
                rec.setValue({fieldId: 'custpage_fbashipaddlamt', value: 0});
                rec.setValue({fieldId: 'custpage_salesprice', value: basePrice});


            } catch(e) {
                console.log('error');
            }
        }

//*******************************************************
//*******************************************************
//************   COSTING CALCULATIONS SCRIPT  ***********
//*******************************************************
//*******************************************************

        function evaluateCosts(){

        try{
            console.log('Function: evaluateCosts Started');
//*******************************************************
// ITEM INFORMATION
//*******************************************************
console.log('Item Search Start');
            //get internal ID of item
            var itemId = rec.getValue('custpage_item');
console.log ('item ' + itemId);

            var itemInformationMapping = itemCostingLibrary.itemInformationSearch(itemId);
            var itemInformation = itemInformationMapping[itemId];
            var htsCode = itemInformation.htsCode;
console.log('hts ' + htsCode);
            var amazonSizeTier = itemInformation.amazonSizeTier;
            var containerCapacity40HQ = itemInformation.containerCapacity40HQ;
            var useContainerCapacityQty = itemInformation.useContainerCapacityQty;  //todo Figure out use TBD
            var countryOfOrigin = rec.getValue('custpage_countryoforigin');
            var fbaItem = rec.getValue('custpage_fbaitem');
console.log('FBM Check ' + fbaItem);
            var bulkItem = rec.getValue('custpage_bulkitem');
            var unitCBM = rec.getValue('custpage_itemcbm');
            var purchasePrice = rec.getValue('custpage_purchaseprice');
            var itemWeight = rec.getValue('custpage_itemweight');
            var itemLength = rec.getValue('custpage_itemlength');
            var itemWidth = rec.getValue('custpage_itemwidth');
            var itemHeight = rec.getValue('custpage_itemheight');
            var basePrice = rec.getValue('custpage_salesprice');
            if (!basePrice){
                basePrice = 0;
            }
console.log('baseprice ' + basePrice);

            var itemLengthGirth = (Math.round(itemLength) + (2 * Math.round(itemWidth)) + (2 * Math.round(itemHeight)));
            var itemWeightCeil = Math.ceil(itemWeight);


//*******************************************************
// DEFAULT COSTING RECORD INFORMATION
//*******************************************************

console.log('Default Start');
            //Retrieve Costing Default Values for later calculations
            var defaultsInformationMapping = itemCostingLibrary.costingDefaultsSearch(); //in future can do params if needed

            var defaultsItemInformation = defaultsInformationMapping;
            var containerEfficiencyOcean = defaultsItemInformation.containerEfficiencyOcean;  //todo use in container qty calc
            var containerLoadableCbmOcean = defaultsItemInformation.containerLoadableCbmOcean;
            var containerLoadableCbmTransfer = defaultsItemInformation.containerLoadableCbmTransfer;
            var fbaAvgMonthsStored = defaultsItemInformation.fbaAvgMonthsStored;
            var fbaStorageFeeStdWeighted = defaultsItemInformation.fbaStorageFeeStdWeighted;
            var fbaStorageFeeOversizeWeighted = defaultsItemInformation.fbaStorageFeeOversizeWeighted;
            var amazonFuelSurchargePct = defaultsItemInformation.amazonFuelSurcharge;
            var fbaDimWeightModifier = defaultsItemInformation.fbaDimWeightModifier;
            var fbaDimWeightMin = defaultsItemInformation.fbaDimWeightMin;
            var fbaDimWeightMax = defaultsItemInformation.fbaDimWeightMax;
            //var fbaPeakSurchActive = defaultsItemInformation.fbaPeakSurchActive;
            var fbmPickingAmt = defaultsItemInformation.fbmPickingAmt;
            var residentialDeliveryPct = defaultsItemInformation.residentialDeliveryPct;
            var commercialDeliveryPct = 100 - residentialDeliveryPct;
            var upsfuelSurchargeDefaultPct = defaultsItemInformation.upsfuelSurchargeDefaultPct;
            var upsPeakSurchargeStd = defaultsItemInformation.upsPeakSurchargeStd;
            var upsPeakSurchargeHoliday = defaultsItemInformation.upsPeakSurchargeHoliday;
            var upsExtendedDeliveryPct = defaultsItemInformation.upsExtendedDeliveryPct;
            var upsExtendedDeliverySurchargeRes = defaultsItemInformation.upsExtendedDeliverySurchargeRes;
            var upsExtendedDeliverySurchargeCom = defaultsItemInformation.upsExtendedDeliverySurchargeCom;
            var upsRemoteDeliveryPct = defaultsItemInformation.upsRemoteDeliveryPct;
            var upsRemoteDeliverySurcharge = defaultsItemInformation.upsRemoteDeliverySurcharge;
            var upsOtherSurcharge = defaultsItemInformation.upsOtherSurcharge;
            var upsLargeLenGirRes = defaultsItemInformation.upsLargeLenGirRes;
            var upsLargeLengthRes = defaultsItemInformation.upsLargeLengthRes;
            var upsLargeLenGirCom = defaultsItemInformation.upsLargeLenGirCom;
            var upsLargeLengthCom = defaultsItemInformation.upsLargeLengthCom;
            var upsAddlHandlingWeight = defaultsItemInformation.upsAddlHandlingWeight;
            var upsAddlHandlingLenGir = defaultsItemInformation.upsAddlHandlingLenGir;
            var upsAddlHandlingLength = defaultsItemInformation.upsAddlHandlingLength;
            var upsAddlHandlingWidth = defaultsItemInformation.upsAddlHandlingWidth;
            var upsOverMaxWeight = defaultsItemInformation.upsOverMaxWeight;
            var upsOverMaxLenGir = defaultsItemInformation.upsOverMaxLenGir;
            var upsOverMaxLength = defaultsItemInformation.upsOverMaxLength;
            var upsOverMaxLimitFee = defaultsItemInformation.upsOverMaxLimitFee;
            var upsLargePackageMinWeight = defaultsItemInformation.upsLargePackageMinWeight;
            var upsDimWeightModifier = defaultsItemInformation.upsDimWeightModifier;
            //var upsRateDiscountPct = defaultsItemInformation.upsRateDiscountPct;  //todo eval
            var returnShippingPct = defaultsItemInformation.returnShippingPct;
            var restockPct = defaultsItemInformation.restockPct;
            var bulkRefundCostMarkupPct = defaultsItemInformation.bulkRefundCostMarkupPct;
            var amazonRefundAdminPct = defaultsItemInformation.amazonRefundAdminPct;
            var amazonRefundFeeMax = defaultsItemInformation.amazonRefundFeeMax;
            var fixedOverheadPct = defaultsItemInformation.fixedOverheadPct;

            var refundPct = rec.getValue('custpage_refundrate');
            var bulkRefundPct = rec.getValue('custpage_refundrate');

console.log('Refund Pct ' + refundPct);

//*******************************************************
// LANDED COSTS
//*******************************************************
console.log('Tariff Start');
            //Tariff
            var tariffInformationMapping = itemCostingLibrary.tariffInformationSearch(htsCode, countryOfOrigin);

            var tariffInformation = tariffInformationMapping[htsCode, countryOfOrigin];
            var tariffPct = rec.getValue('custpage_tariffratepct');
            var tariffPerUnit = tariffInformation.tariffDutyPerUnit;
            var tariffTotal = (purchasePrice * (tariffPct * 0.01)) + tariffPerUnit;

console.log('Tariff % ' + tariffPct);
console.log('Tariff Total ' + tariffTotal);

            //*******************************************************
            //Ocean Lanes
            //
            // var oceanLaneInformationMapping = itemCostingLibrary.oceanLaneInfoSearch(countryOfOrigin);  //todo can delete this search call?
            //
            // var oceanLaneInformation = oceanLaneInformationMapping[countryOfOrigin];
            var oceanLaneWeightedCost = rec.getValue('custpage_seafreightrate');
            oceanLaneWeightedCost = ((oceanLaneWeightedCost / containerLoadableCbmOcean) * unitCBM);
console.log('Ocean Lane Cost ' + oceanLaneWeightedCost);

            /*
                        //todo for later - stacked box fee concept
                        //if container box is false
                        if (!useContainerCapacityQty){
                            //Divide the weighted lane cost by usable CBM then multiply by unit cbm(from default record)
                            oceanLaneWeightedCost = ((oceanLaneWeightedCost / containerLoadableCbmOcean) * unitCBM);
                        } else {
                            //get the efficient qty amount and divide lane cost by that amount.
                            var efficientContainerQty = containerCapacity40HQ * (containerEfficiencyOcean*0.01);
                            oceanLaneWeightedCost = (oceanLaneWeightedCost/efficientContainerQty);
                        }*/

            //*******************************************************
            //Sourcing
console.log('Sourcing Start');
            var sourcingInformationMapping = itemCostingLibrary.sourcingInfoSearch(countryOfOrigin);

            var sourcingInformation = sourcingInformationMapping[countryOfOrigin];
            var sourcingCommissionPct = (sourcingInformation.sourcingCommissionPct);
            var sourcingTotal = ((sourcingCommissionPct * 0.01) * purchasePrice);

            //TOTAL LANDED COST FEES

            var landedCostTotal = (tariffTotal + oceanLaneWeightedCost + sourcingTotal);

//*******************************************************
// TRANSFER COSTS
//*******************************************************
console.log('Transfer Start');
            //FBM Transfer Lanes
            var transferCategory = 'fbm';
            var fbmTransferInformationMapping = itemCostingLibrary.transferLaneInfoSearch(transferCategory);

            var fbmTransferLaneInformation = fbmTransferInformationMapping[transferCategory];
            var transferLaneWeightedCostFBM = fbmTransferLaneInformation.transferLaneWeightedCost;

            //Divide the weighted lane cost by usable CBM then multiply by unit cbm(from default record)
            transferLaneWeightedCostFBM = ((transferLaneWeightedCostFBM/containerLoadableCbmTransfer) * unitCBM);

//*******************************************************
            //FBA Transfer Lanes
            transferCategory = 'fba';
            var fbaTransferInformationMapping = itemCostingLibrary.transferLaneInfoSearch(transferCategory);

            var fbaTransferLaneInformation = fbaTransferInformationMapping[transferCategory];
            var transferLaneWeightedCostFBA = fbaTransferLaneInformation.transferLaneWeightedCost;

            //Divide the weighted lane cost by usable CBM then multiply by unit cbm(from default record)
            transferLaneWeightedCostFBA = ((transferLaneWeightedCostFBA/containerLoadableCbmTransfer) * unitCBM);

//*******************************************************
// STORAGE COSTS
//*******************************************************
console.log('Storage Start');
            //FBA Storage
            //calculate item cubic feet (used for Amazon's calculations)
            var fbaCubicFeet = ((itemLength * itemWidth * itemHeight)/1728);

            //use item default costing values to determine FBA Storage Costs. Oversize (ID: 1) and Standard-Size (ID: 2)
            if (amazonSizeTier == 1){
                var fbaStorageCost = (fbaCubicFeet * fbaAvgMonthsStored * fbaStorageFeeOversizeWeighted);
            } else if (amazonSizeTier== 2){
                var fbaStorageCost = (fbaCubicFeet * fbaAvgMonthsStored * fbaStorageFeeStdWeighted);
            }

//*******************************************************
            //FBM Storage -defaulting to zero for now (concept of unlimited Space.
            var fbmStorageCost = 0;

//*******************************************************
// FULFILLMENT COSTS
//*******************************************************
console.log('Fulfillment Start');
            //FBA Fulfillment

            //Calculate FBA Dim Weight
            var amazonDimWeight = ((itemLength * itemWidth * itemHeight) / fbaDimWeightModifier);

            // Determine if weight or FBA Dim Weight is used
            fbaWeight = amazonDimWeight;

            // if item weight is > amazon's dimensional weight or outside of the Dim Weight parameters, use the item actual weight
            if (itemWeight > amazonDimWeight || itemWeight <= fbaDimWeightMin || itemWeight > fbaDimWeightMax) {
                fbaWeight = itemWeight;
            }

            //Call FBA Fulfillment Search
            var fbaFulfillInformationMapping = itemCostingLibrary.fbaFulfillInfoSearch(fbaWeight, itemLength, itemWidth, itemHeight, itemLengthGirth)

            //Import Search Values
            var fbaFulfillInformation = fbaFulfillInformationMapping[fbaWeight, itemLength, itemWidth, itemHeight, itemLengthGirth];
            //var fbaFulfillFeeId = fbaFulfillInformation.fbaFulfillFeeId;
            var fbaFulfillBaseFee = fbaFulfillInformation.fbaFulfillBaseFee;
            var fbaFulfillPeakFee = fbaFulfillInformation.fbaFulfillPeakFee;
            var fbaFulfillFeePerPound = fbaFulfillInformation.fbaFulfillFeePerPound;
            var fbaFulfillPerPoundTrigger = fbaFulfillInformation.fbaFulfillPerPoundTrigger;

            //Logic - Calculate which fees apply to the item
console.log('fbaFulfillBaseFee ' + fbaFulfillBaseFee);

            //Weight over Per Pound Trigger
            var weightOverPerLbTrigger = fbaWeight - fbaFulfillPerPoundTrigger;

            //eliminate the possibility of negative fees from sub-one pound items
            if (weightOverPerLbTrigger < 1) {
                weightOverPerLbTrigger = 0
            }
            //round up the trigger so multiple can be properly calculated.
            weightOverPerLbTrigger = Math.ceil(weightOverPerLbTrigger);

            //pounds over trigger * Fee per Pound
            var amzPerPoundFees = weightOverPerLbTrigger * fbaFulfillFeePerPound;

            //Get Amazon Variables
            var amzPercentChange = rec.getValue('custpage_fbafulfillmentchange');
console.log('Amazon % Change orig ' + amzPercentChange);
            amzPercentChange = (amzPercentChange * 0.01) + 1;
console.log('Amazon % Change NEW ' + amzPercentChange);
            var amzAmountChange = rec.getValue('custpage_fbashipaddlamt');
console.log('Amazon Amount Change ' + amzAmountChange);


            //Set FBA Fulfillment values
            var fbaFulfillSubtotal = (fbaFulfillBaseFee + amzPerPoundFees);
            var amazonFuelSurchargeAmt = ((amazonFuelSurchargePct * 0.01) * fbaFulfillSubtotal);
            var fbaFulfillTotal = amzPercentChange * (fbaFulfillSubtotal + amazonFuelSurchargeAmt + amzAmountChange);
console.log('FBA Fulfill Total ' + fbaFulfillTotal);

//*******************************************************
            //FBM Picking

            var itemPickCostFbm = (fbmPickingAmt * unitCBM);
console.log('itemPickCostFBM ' + itemPickCostFbm);

//*******************************************************
            //FBM Shipping (Delivered Cost Record)
            //round item dimensions
            var fbmItemLength = Math.round(itemLength);
            var fbmItemWidth = Math.round(itemWidth);
            var fbmItemHeight = Math.round(itemHeight);
            var fbmItemLengthGirth = (fbmItemLength + (2 * fbmItemWidth) + (2 * fbmItemHeight));

            //Calculate UPS Dim Weight
            var fbmDimWeight = (Math.ceil((fbmItemLength * fbmItemWidth * fbmItemHeight) / upsDimWeightModifier));

            //Determine if actual Weight or UPS Dim Weight is used & set fbmWeight Value
            fbmWeight = fbmDimWeight;

            if (itemWeightCeil > fbmDimWeight) {
                fbmWeight = itemWeightCeil;
            }
            //Large Package Minimum Wt is upsLargePackageMinWeight (currently 90 lbs).
            // Check if Large Package applies and if so, set weight to custdefault large package min weight

            if (fbmWeight < upsLargePackageMinWeight ){
                if (fbmItemLength > upsLargeLengthRes  || fbmItemLength > upsLargeLengthCom ){
                    fbmWeight = upsLargePackageMinWeight;
                }
                if (fbmItemLengthGirth > upsLargeLenGirRes  || fbmItemLengthGirth > upsLargeLenGirCom ){
                    fbmWeight = upsLargePackageMinWeight;
                }
            }

            //Call Delivered Cost Search
            var fbmDeliveredCostMapping = itemCostingLibrary.fbmShippingInfoSearch(fbmWeight);
console.log('FBM Shipping Search Run');

            //Import Search Values
            var fbmDeliveredCostInformation = fbmDeliveredCostMapping[fbmWeight];
            var shippingBaseFee = fbmDeliveredCostInformation.shippingBaseFee;  //costBaseFee
            var shippingResidentialFee = fbmDeliveredCostInformation.shippingResidentialFee;  //costResidentialFee
            var shippingOverMaxLimitFee = fbmDeliveredCostInformation.shippingOverMaxLimitFee;
            var shippingPeakSurchargeLarge = fbmDeliveredCostInformation.shippingPeakSurchargeLarge;
            var shippingPeakSurchargeAH = fbmDeliveredCostInformation.shippingPeakSurchargeAH;
            shippingAHWeight = fbmDeliveredCostInformation.shippingAHWeight;
            var shippingAHLenGirth = fbmDeliveredCostInformation.shippingAHLenGirth;
            var shippingAHLength = fbmDeliveredCostInformation.shippingAHLength;
            var shippingAHWidth = fbmDeliveredCostInformation.shippingAHWidth;
            //var shippingAHPackaging = fbmDeliveredCostInformation.shippingAHPackaging;
            var shippingLgPkgLenGirthRes = fbmDeliveredCostInformation.shippingLgPkgLenGirthRes;
            var shippingLgPkgLengthRes = fbmDeliveredCostInformation.shippingLgPkgLengthRes;
            var shippingLgPkgLenGirthCom = fbmDeliveredCostInformation.shippingLgPkgLenGirthCom;
            var shippingLgPkgLengthCom = fbmDeliveredCostInformation.shippingLgPkgLengthCom;

            upsExtendedDeliveryPct = (upsExtendedDeliveryPct * 0.01);
            upsRemoteDeliveryPct = (upsRemoteDeliveryPct * 0.01);
            residentialDeliveryPct = (residentialDeliveryPct * 0.01);
            commercialDeliveryPct = (commercialDeliveryPct * 0.01);
console.log('residential delivery % ' + residentialDeliveryPct);

            //IF Item weight (ceiling) is > 50, use item weight to get AH Weight Fee
            if (itemWeightCeil > 50) {
                //call new library search w/ actual weight
                var actualAHWeightMapping = itemCostingLibrary.actualAHSearch(itemWeightCeil);
                logModule.audit({title: 'Actual AH Weight Search Run'});

                //return Additional Handling: Weight fee
                var actualAHWeightInformation = actualAHWeightMapping[itemWeightCeil];
                var actualAHWeightFee = actualAHWeightInformation.actualAHWeightFee;

                //use that in below calc for AH weight
                shippingAHWeight = actualAHWeightFee;

            }

            //Fees that apply to all shipments
            var shippingPeakSurchargeTotal = (upsPeakSurchargeStd + upsPeakSurchargeHoliday);
            var shippingExtDelvAreaSurch = (upsExtendedDeliveryPct * ((residentialDeliveryPct * upsExtendedDeliverySurchargeRes) + (commercialDeliveryPct * upsExtendedDeliverySurchargeCom )));
            var shippingRemoteDelvAreaSurch = (upsRemoteDeliveryPct * upsRemoteDeliverySurcharge);


            //Large Package fee check
            var shipCostLgPkgLenGirthRes = 0;
            var shipCostLgPkgLenGirthCom = 0;
            var shipCostLgPkgLengthRes = 0;
            var shipCostLgPkgLengthCom = 0;

            //Large Package Fee Check
            // set Large Package Peak Surcharge
            var shipCostPeakSurchLarge = shippingPeakSurchargeLarge;

            //Run through Large Package Triggers (reverse priority) and set record informational checkboxes
            //Priority 2: Large Package Length
            if (fbmItemLength >= upsLargeLengthRes){
                shipCostLgPkgLengthRes = shippingLgPkgLengthRes;
            }
            if (fbmItemLength >= upsLargeLengthCom){
                shipCostLgPkgLengthCom = shippingLgPkgLengthCom;
            }

            var shipCostLargePackage = (shipCostLgPkgLengthRes + shipCostLgPkgLengthCom);

            //Priority 1: Large Package Length + Girth
            if (fbmItemLengthGirth >= upsLargeLenGirRes) {
                shipCostLgPkgLenGirthRes = shippingLgPkgLenGirthRes;
            }
            if (fbmItemLengthGirth >= upsLargeLenGirCom) {
                shipCostLgPkgLenGirthCom = shippingLgPkgLenGirthCom;
            }
            //determine which prioritized amount is used on this item
            if ((shipCostLgPkgLenGirthRes + shipCostLgPkgLenGirthCom) > (shipCostLgPkgLengthRes + shipCostLgPkgLengthCom)){
                shipCostLargePackage = (shipCostLgPkgLenGirthRes + shipCostLgPkgLenGirthCom);
            }
            //clear large peak surcharge if large package fee doesn't apply
            if (shipCostLargePackage <= 0){
                shipCostPeakSurchLarge = 0
            }
            //Additional Handling fee check
            var shipCostAdditionalHandling = 0;

            // set Additional Handling Peak Surch
            var shipCostPeakSurchAH = shippingPeakSurchargeAH;

            //Run through Additional Handling (reverse priority) and check record informational boxes

            //Priority 4: Width (2nd longest dimension)
            if (fbmItemWidth > upsAddlHandlingWidth){
                shipCostAdditionalHandling = shippingAHWidth;
            }

            //Priority 3: Length (longest dimension)
            if (fbmItemLength > upsAddlHandlingLength){
                shipCostAdditionalHandling = shippingAHLength;
            }

            //Priority 2: Length + Girth
            if (fbmItemLengthGirth > upsAddlHandlingLenGir){
                shipCostAdditionalHandling = shippingAHLenGirth;
            }

            //Priority 1: Weight
            if (itemWeightCeil > upsAddlHandlingWeight){
                shipCostAdditionalHandling = shippingAHWeight;
            }

            //If Large Package Fee applies, Additional Handling Fee is 0 (Large Package Fees take priority as an either/or)
            if (shipCostLargePackage > 0){
                shipCostAdditionalHandling = 0
            }
console.log('ShipCost Addl Handling ' + shipCostAdditionalHandling);
            //clear AH peak surcharge if additional handling fee doesn't apply
            if (shipCostAdditionalHandling <= 0){
                shipCostPeakSurchAH = 0
            }

            //Over Maximum Limits Fee Check
            var shipCostMaxLimitFee = 0;  //was costMaxLimitFee

            //If any of the triggers is met, add max limit fee.
            if (itemWeightCeil > upsOverMaxWeight){
                shipCostMaxLimitFee = upsOverMaxLimitFee;
            }
            if (fbmItemLength > upsOverMaxLength){
                shipCostMaxLimitFee = upsOverMaxLimitFee;
            }
            if (fbmItemLengthGirth > upsOverMaxLenGir){
                shipCostMaxLimitFee = upsOverMaxLimitFee;
            }


            //Calculate total fees and total cost (fees * fuel surcharge %)
console.log('Calculate Values Started');

            var fbmShippingFeesTotal = (shippingBaseFee + shippingResidentialFee + shippingPeakSurchargeTotal + shippingExtDelvAreaSurch + shippingRemoteDelvAreaSurch + upsOtherSurcharge + shipCostAdditionalHandling + shipCostPeakSurchAH + shipCostLargePackage + shipCostPeakSurchLarge + shipCostMaxLimitFee);

            var upsFuelSurchargeMultiplier = (upsfuelSurchargeDefaultPct * 0.01);
            var upsFuelSurchargeAmount = (upsFuelSurchargeMultiplier * fbmShippingFeesTotal);
            var totalFBMShippingCost = (fbmShippingFeesTotal + upsFuelSurchargeAmount);


            //TODO SET FBM PERCENTAGE INCREASE
            //Get Amazon Variables
            var fbmPercentChange = rec.getValue('custpage_fbmshipratechange');
            console.log('FBM % Change orig ' + fbmPercentChange);
            fbmPercentChange = (fbmPercentChange * 0.01) + 1;
            console.log('FBM % Change NEW ' + fbmPercentChange);
            var fbmAmountChange = rec.getValue('custpage_fbmshipaddlamt');
            console.log('FBM Amount Change ' + fbmAmountChange);
            //TODO SET FBM AMOUNT INCREASE

            var totalFbmFulfillmentCost = fbmPercentChange * (totalFBMShippingCost + itemPickCostFbm + fbmAmountChange);

//*******************************************************
// SOLD COSTS
//*******************************************************
console.log('Sold Costs Start');
            //Sales Commissions
            //FBM
            var itemClassification = 'fbm';
            var fbmSalesCommissionMapping = itemCostingLibrary.salesCommissionInfoSearch(itemClassification);

            var fbmSalesCommissionInformation = fbmSalesCommissionMapping[itemClassification];
            var fbmSalesCommissionWeightedPct = fbmSalesCommissionInformation.salesCommissionWeightedPct;
            var fbmSalesCommissionWeightedPerUnit = fbmSalesCommissionInformation.salesCommissionWeightedPerUnit;


            //Calculate item Commission Cost values
            var fbmCommissionPctCost = ((fbmSalesCommissionWeightedPct * 0.01) * basePrice);
            var fbmCommissionPerUnitCost = (fbmSalesCommissionWeightedPerUnit * basePrice);
console.log('FBM Commission Per Unit ' + fbmCommissionPerUnitCost);


            //FBA
            itemClassification = 'fba';
            var fbaSalesCommissionMapping = itemCostingLibrary.salesCommissionInfoSearch(itemClassification);

            var fbaSalesCommissionInformation = fbaSalesCommissionMapping[itemClassification];
            var fbaSalesCommissionWeightedPct = fbaSalesCommissionInformation.salesCommissionWeightedPct;
            var fbaSalesCommissionWeightedPerUnit = fbaSalesCommissionInformation.salesCommissionWeightedPerUnit;

            //Calculate item Commission Cost values
            var fbaCommissionPctCost = ((fbaSalesCommissionWeightedPct * 0.01) * basePrice);
            var fbaCommissionPerUnitCost = (fbaSalesCommissionWeightedPerUnit * basePrice);


            //Bulk
            itemClassification = 'bulk';
            var bulkSalesCommissionMapping = itemCostingLibrary.salesCommissionInfoSearch(itemClassification);

            var bulkSalesCommissionInformation = bulkSalesCommissionMapping[itemClassification];
            var bulkSalesCommissionWeightedPct = bulkSalesCommissionInformation.salesCommissionWeightedPct;
            var bulkSalesCommissionWeightedPerUnit = bulkSalesCommissionInformation.salesCommissionWeightedPerUnit;

            //Calculate item Commission Cost values
            var bulkCommissionPctCost = ((bulkSalesCommissionWeightedPct * 0.01) * basePrice);
            var bulkCommissionPerUnitCost = (bulkSalesCommissionWeightedPerUnit * basePrice);


//*******************************************************
//Refunds & Returns
//*******************************************************

            var netLandedCost = purchasePrice + landedCostTotal;

            // Calculate Amazon Admin Fee
            // Calculate Admin Fee from Amazon Commission Amount
            var refundAmazonAdminFee = (((amazonRefundAdminPct * 0.01) * fbmCommissionPctCost) + fbmCommissionPerUnitCost);

            // If Admin fee > admin fee cap, then use admin fee cap
            if (refundAmazonAdminFee > (amazonRefundFeeMax)) {
                refundAmazonAdminFee = amazonRefundFeeMax;
            }
            refundAmazonAdminFee = (refundAmazonAdminFee * (refundPct * 0.01));

            // Calculate Inventory Loss
            var refundInventoryLoss = ((refundPct * 0.01) * (1 - (returnShippingPct * 0.01)) * netLandedCost);

            // Calculate Unrecoverable Inventory
            var refundUnrecoverableInventory = (((refundPct * 0.01) * (returnShippingPct * 0.01) * (1 - (restockPct * 0.01))) * netLandedCost);

            // Calculate Pick Loss FBM
            var refundPickLossFBM = (((refundPct * 0.01) * itemPickCostFbm) + transferLaneWeightedCostFBM + fbmStorageCost);

            // Calculate Fulfillment Loss FBA
            var refundFulfillLossFBA = (((refundPct * 0.01) * fbaFulfillTotal) + transferLaneWeightedCostFBA + fbaStorageCost);

            // Calculate Label Loss FBM
            var refundLabelLossFBM = ((refundPct * 0.01) * totalFBMShippingCost);

            // Calculate Return Shipping Cost
            var refundReturnShipCost = (((refundPct* 0.01) * (returnShippingPct * 0.01)) * totalFBMShippingCost);

            // Calculate Inventory Cost Recovery (note: positive cost)
            var refundInventoryCostRecovery = (((refundPct * 0.01) * (returnShippingPct * 0.01) * (restockPct * 0.01)) * netLandedCost);

            // Calculate FBM Total Refund Rate
            var refundTotalFBM = (refundAmazonAdminFee + refundInventoryLoss + refundUnrecoverableInventory + refundPickLossFBM + refundLabelLossFBM + refundReturnShipCost - refundInventoryCostRecovery);

            // Calculate FBA Total Refund Rate
            var refundTotalFBA = (refundAmazonAdminFee + refundInventoryLoss + refundUnrecoverableInventory + refundFulfillLossFBA + refundReturnShipCost - refundInventoryCostRecovery);

            // Calculate Bulk Total Refund Rate
            var refundTotalBulk = (((bulkRefundPct * 0.01) * (1 + (bulkRefundCostMarkupPct * 0.01))) * basePrice);

            //Set Total Sold Cost Values
            var fbmSoldCostTotal = (refundTotalFBM + fbmCommissionPctCost + fbmCommissionPerUnitCost);
            var fbaSoldCostTotal = (refundTotalFBA + fbaCommissionPctCost + fbaCommissionPerUnitCost);
            var bulkSoldCostTotal = (refundTotalBulk + bulkCommissionPctCost + bulkCommissionPerUnitCost);


//*******************************************************
//FIXED OVERHEAD
//*******************************************************
            //Calculate cost for item and set field value on record
            var fixedOverheadAmount = ((fixedOverheadPct * 0.01) * purchasePrice);


//*******************************************************
// FINAL CALCULATIONS
//*******************************************************
console.log('Final Calc Start');


            //FBM
            //Contribution Margin Costs (sum of)
            //Purchase Price
            //Total Landed Cost
            //FBM Weighted Transfer Costs
            //FBM Storage Cost
            //Total FBM Fulfillment Fees
            //FBM Sold Costs Total
console.log('Purchase Price ' + purchasePrice);
console.log('FBM landed cost total ' + landedCostTotal);
console.log('FBM transfer Lane Weighted ' + transferLaneWeightedCostFBM);
console.log('FBM Storage Cost ' + fbmStorageCost);
console.log('FBM Total FBM Fulfillment ' + totalFbmFulfillmentCost);
console.log('FBM Sold Cost Total ' + fbmSoldCostTotal);



            var fbmContributionMarginCosts = (purchasePrice + landedCostTotal + transferLaneWeightedCostFBM + fbmStorageCost + totalFbmFulfillmentCost + fbmSoldCostTotal);
/*

            //Contribution Margin (Amount)
            //Base Price - Contribution Margin Costs
            var fbmContributionMarginAmt = (basePrice - fbmContributionMarginCosts);

            //Contribution Margin Percent
            //Contribution Margin divided by Base Price
            var fbmContributionMarginPct = ((fbmContributionMarginAmt / basePrice) * 100);
*/

            //Gross Margin Costs
            //Contribution Margin Costs + Fixed Overhead Amt
            var fbmGrossMarginCosts = (fbmContributionMarginCosts + fixedOverheadAmount);
console.log('FBM Gross Costs ' + fbmGrossMarginCosts);
            //Gross Margin (Amount)
            //Base Price - Gross Margin
            var fbmGrossMarginAmt = (basePrice - fbmGrossMarginCosts)
console.log('FBM Gross Amount ' + fbmGrossMarginAmt);

            //Gross Margin Percent
            //Gross Margin divided by Base Price
            var fbmGrossMarginPct = ((fbmGrossMarginAmt / basePrice) * 100);
console.log('FBM Gross % ' + fbmGrossMarginPct);

            //FBA
            //Contribution Margin Costs (sum of)
            //Purchase Price
            //Total Landed Cost
            //FBA Weighted Transfer Costs
            //FBA Storage Cost
            //Total FBA Fulfillment Fees
            //FBA Sold Costs Total
    console.log('Purchase Price ' + purchasePrice);
    console.log('FBA landed cost total ' + landedCostTotal);
    console.log('FBA transfer Lane Weighted ' + transferLaneWeightedCostFBA);
    console.log('FBA Storage Cost ' + fbaStorageCost);
    console.log('FBA Total FBM Fulfillment ' + fbaFulfillTotal);
    console.log('FBA Sold Cost Total ' + fbaSoldCostTotal);
            var fbaContributionMarginCosts = (purchasePrice + landedCostTotal + transferLaneWeightedCostFBA + fbaStorageCost + fbaFulfillTotal + fbaSoldCostTotal);

            //Gross Margin Costs
            //Contribution Margin Costs + Fixed Overhead Amt
            var fbaGrossMarginCosts = (fbaContributionMarginCosts + fixedOverheadAmount);

            //Gross Margin (Amount)
            //Base Price - Gross Margin
            var fbaGrossMarginAmt = (basePrice - fbaGrossMarginCosts)

            //Gross Margin Percent
            //Gross Margin divided by Base Price
            var fbaGrossMarginPct = ((fbaGrossMarginAmt / basePrice) * 100);
console.log('FBA Gross % ' + fbaGrossMarginPct);

            //BULK
            //Conditional logic for if we or customer pays Tariff and/or Ocean Freights
            //Get field values for customer pays checkboxes

            //tariff bulk
            var bulkTariffTotal = tariffTotal;

            //sea freight bulk
            var  bulkOceanLaneCost = oceanLaneWeightedCost;

            // add up landed cost total for bulk items
            var bulkLandedCostTotal = (sourcingTotal + bulkTariffTotal + bulkOceanLaneCost);

            //Contribution Margin Costs (sum of)
            //Purchase Price
            //Bulk Item Landed Cost Total
            //Bulk Sold Costs Total
            var bulkContributionMarginCosts = (purchasePrice + bulkLandedCostTotal + bulkSoldCostTotal);

            //Gross Margin Costs
            //Contribution Margin Costs + Fixed Overhead Amt
            var bulkGrossMarginCosts = (bulkContributionMarginCosts + fixedOverheadAmount);

            //Gross Margin (Amount)
            //Base Price - Gross Margin
            var bulkGrossMarginAmt = (basePrice - bulkGrossMarginCosts)

            //Gross Margin Percent
            //Gross Margin divided by Base Price
            var bulkGrossMarginPct = ((bulkGrossMarginAmt / basePrice) * 100);
console.log('Bulk Gross % ' + bulkGrossMarginPct);


            //Set Calculated Margin Values on Form
console.log('Set Field Values');

            if (fbaItem === true) {          //FBA Item
                rec.setValue({fieldId: 'custpage_grossmarginamtnew', value: fbaGrossMarginAmt.toFixed(2)});
                
                //if margin % is negative, NetSuite throws an error.  For display, this converts it to a string and formats.
                var fbaGrossPctString = '';
                if(fbaGrossMarginPct < 0){
                    fbaGrossMarginPct = Math.abs(fbaGrossMarginPct);
                    fbaGrossPctString = '(';
                    fbaGrossPctString += fbaGrossMarginPct.toFixed(2);
                    fbaGrossPctString += '%)';
                } else {
                    fbaGrossPctString = fbaGrossMarginPct.toFixed(2);
                    fbaGrossPctString += '%';
                }                             
                rec.setValue({fieldId: 'custpage_grossmarginpctnew', value: fbaGrossPctString});

            } else if (bulkItem === true) {  //Bulk Item
                rec.setValue({fieldId: 'custpage_grossmarginamtnew', value: bulkGrossMarginAmt.toFixed(2)});
                
                var bulkGrossPctString = '';
                if(bulkGrossMarginPct < 0){
                    bulkGrossMarginPct = Math.abs(bulkGrossMarginPct);
                    bulkGrossPctString = '(';
                    bulkGrossPctString += bulkGrossMarginPct.toFixed(2);
                    bulkGrossPctString += '%)';
                } else {
                    bulkGrossPctString = bulkGrossMarginPct.toFixed(2);
                    bulkGrossPctString += '%';
                }
                rec.setValue({fieldId: 'custpage_grossmarginpctnew', value: bulkGrossPctString});

            }  else {                       //FBM Item (neither of above)
                rec.setValue({fieldId: 'custpage_grossmarginamtnew', value: fbmGrossMarginAmt.toFixed(2)});

                var fbmGrossPctString = '';
                if(fbmGrossMarginPct < 0){
                    fbmGrossMarginPct = Math.abs(fbmGrossMarginPct);
                    fbmGrossMarginPct = fbmGrossMarginPct.toFixed(2);
                    fbmGrossPctString = '(';
                    fbmGrossPctString += fbmGrossMarginPct;
                    fbmGrossPctString += '%)';
                } else {
                    fbmGrossMarginPct = fbmGrossMarginPct.toFixed(2);
                    fbmGrossPctString = fbmGrossMarginPct;
                    fbmGrossPctString += '%';
                }
                rec.setValue({fieldId: 'custpage_grossmarginpctnew', value: fbmGrossPctString});
            }

            }catch (e) {
            console.log('error');
        }

        }


        return {
            fieldChanged : fieldChanged,
            pageInit: pageInit,
            resetValues: resetValues,
            evaluateCosts: evaluateCosts
        };
});
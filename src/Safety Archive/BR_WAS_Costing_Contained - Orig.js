/*
 ***********************************************************************
 * Author:		Mark Chuberka
 * Date:		2022-08-16
 * File:		BR_WAS_Costing_Contained.js
 * Version:     0.9
 *
 * This is an update script for...  //todo fill in
 ***********************************************************************/

/**
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @NScriptType WorkflowActionScript
 * @see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4460429314.html
 */


define(['N/search', 'N/log', 'N/record', '../FileCabinet/SuiteScripts/Item Costing/BR_LIB_Item_Costing'],
    /**
     * @return {{
     *   onAction: Function,
     * }}
     */

    function (searchModule, logModule, recordModule, itemCostingLibrary) {
        /**
         * @param {OnActionContext} context
         * @return {void}
         */
    // Set Global Variables
        var rec = {};
        var fbaWeight = 0;
        var fbmWeight = 0;
        var shippingAHWeight = 0;


        /**
         * @param {OnActionContext} context
         * @return {void}
         */
        const exports = {};

        function onAction(context) {
            try {
                rec = context.newRecord;

//*******************************************************
// ITEM INFORMATION
//*******************************************************
            //get internal ID of item
            var itemId = rec.getValue({fieldId: 'custrecord_br_cst1_item'});
            // logModule.debug({title: 'Item ID', details: itemId});

            var itemInformationMapping = itemCostingLibrary.itemInformationSearch(itemId);

            var itemInformation = itemInformationMapping[itemId];
                var basePrice = itemInformation.basePrice;
                var countryOfOrigin = itemInformation.countryOfOrigin;
                var fbaItem = itemInformation.fbaItem;
                var bulkItem = itemInformation.bulkItem;
                var htsCode = itemInformation.htsCode;
                var unitCBM = itemInformation.unitCBM;
                var purchasePrice = itemInformation.purchasePrice;
                var primaryTariff = itemInformation.primaryTariff;
                var itemWeight = itemInformation.itemWeight;
                var itemLength = itemInformation.itemLength;
                var itemWidth = itemInformation.itemWidth;
                var itemHeight = itemInformation.itemHeight;
                var itemDimWeight = itemInformation.itemDimWeight;
                var amazonSizeTier = itemInformation.amazonSizeTier;
                var maxQtyPerLabel = itemInformation.maxQtyPerLabel;
                var itemDescription = itemInformation.itemDescription;
                var preferredVendor = itemInformation.preferredVendor;
                var itemCategory = itemInformation.itemCategory;
                var itemFamily = itemInformation.itemFamily;
                var productStatus = itemInformation.productStatus;
                var amazonASIN = itemInformation.amazonASIN;
                var containerCapacity40HQ = itemInformation.containerCapacity40HQ;
                var useContainerCapacityQty = itemInformation.useContainerCapacityQty;

                logModule.debug({title: 'ASIN', details: amazonASIN});
                logModule.debug({title: 'Use Container Capacity', details: useContainerCapacityQty});
                logModule.debug({title: 'Product Status', details: productStatus});


                var itemLengthGirth = (Math.round(itemLength) + (2 * Math.round(itemWidth)) + (2 * Math.round(itemHeight)));

                var itemWeightCeil = Math.ceil(itemWeight);

            //set field values
            rec.setValue({fieldId: 'custrecord_br_cst1_item_base_price', value: basePrice});
            rec.setValue({fieldId: 'custrecord_br_cst1_country_of_origin', value: countryOfOrigin});
            rec.setValue({fieldId: 'custrecord_br_cst1_fba', value: fbaItem});
            rec.setValue({fieldId: 'custrecord_br_cst1_bulk_item', value: bulkItem});
            rec.setValue({fieldId: 'custrecord_br_cst1_hts_code', value: htsCode});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_cbm', value: unitCBM});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_purchase_price', value: purchasePrice});
            rec.setValue({fieldId: 'custrecord_br_cst1_tariff', value: primaryTariff});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_weight', value: itemWeight});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_length', value: itemLength});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_width', value: itemWidth});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_height', value: itemHeight});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_dimweight', value: itemDimWeight});
            rec.setValue({fieldId: 'custrecord_br_cst1_amazon_size_tier', value: amazonSizeTier});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_max_per_label', value: maxQtyPerLabel});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_length_girth', value: itemLengthGirth});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_description', value: itemDescription});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_preferred_vendor', value: preferredVendor});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_category', value: itemCategory});
            rec.setValue({fieldId: 'custrecord_br_cst1_item_family', value: itemFamily});
            rec.setValue({fieldId: 'custrecord_br_cst1_product_status', value: productStatus});
            rec.setValue({fieldId: 'custrecord_br_cst1_amazon_asin', value: amazonASIN});
            rec.setValue({fieldId: 'custrecord_br_cst1_container_qty_40hq', value: containerCapacity40HQ});
            rec.setValue({fieldId: 'custrecord_br_cst1_use_container_qty', value: useContainerCapacityQty});

//*******************************************************
// DEFAULT COSTING RECORD INFORMATION
//*******************************************************
        //Retrieve Costing Default Values for later calculations
        var defaultsInformationMapping = itemCostingLibrary.costingDefaultsSearch(); //in future can do params if needed

        var defaultsItemInformation = defaultsInformationMapping;
            var containerSizeOcean = defaultsItemInformation.containerSizeOcean;
            var containerCbmOcean = defaultsItemInformation.containerCbmOcean;
            var containerEfficiencyOcean = defaultsItemInformation.containerEfficiencyOcean;  //todo use in container qty calc
            var containerLoadableCbmOcean = defaultsItemInformation.containerLoadableCbmOcean;
            var containerSizeTransfer = defaultsItemInformation.containerSizeTransfer;
            var containerCbmTransfer = defaultsItemInformation.containerCbmTransfer;
            var containerEfficiencyTransfer = defaultsItemInformation.containerEfficiencyTransfer;
            var containerLoadableCbmTransfer = defaultsItemInformation.containerLoadableCbmTransfer;
            var fbaAvgMonthsStored = defaultsItemInformation.fbaAvgMonthsStored;
            var fbaStorageFeeStd = defaultsItemInformation.fbaStorageFeeStd;
            var fbaStorageFeeStdPeak = defaultsItemInformation.fbaStorageFeeStdPeak;
            var fbaStorageFeeStdWeighted = defaultsItemInformation.fbaStorageFeeStdWeighted;
            var fbaStorageFeeOversize = defaultsItemInformation.fbaStorageFeeOversize;
            var fbaStorageFeeOversizePeak = defaultsItemInformation.fbaStorageFeeOversizePeak;
            var fbaStorageFeeOversizeWeighted = defaultsItemInformation.fbaStorageFeeOversizeWeighted;
            var amazonFuelSurchargePct = defaultsItemInformation.amazonFuelSurcharge;
            var fbaDimWeightModifier = defaultsItemInformation.fbaDimWeightModifier;
            var fbaDimWeightMin = defaultsItemInformation.fbaDimWeightMin;
            var fbaDimWeightMax = defaultsItemInformation.fbaDimWeightMax;
            var fbaPeakSurchActive = defaultsItemInformation.fbaPeakSurchActive;
            var fbmPickingAmt = defaultsItemInformation.fbmPickingAmt;
            var upsZone2Pct = defaultsItemInformation.upsZone2Pct;
            var upsZone3Pct = defaultsItemInformation.upsZone3Pct;
            var upsZone4Pct = defaultsItemInformation.upsZone4Pct;
            var upsZone5Pct = defaultsItemInformation.upsZone5Pct;
            var upsZone6Pct = defaultsItemInformation.upsZone6Pct;
            var upsZone7Pct = defaultsItemInformation.upsZone7Pct;
            var upsZone8Pct = defaultsItemInformation.upsZone8Pct;
            var upsZone44Pct = defaultsItemInformation.upsZone44Pct;
            var upsZone45Pct = defaultsItemInformation.upsZone45Pct;
            var upsZone46Pct = defaultsItemInformation.upsZone46Pct;
            var upsGroundPct = defaultsItemInformation.upsGroundPct;
            var ups2ndDayAirPct = defaultsItemInformation.ups2ndDayAirPct;
            var ups3DaySelectPct = defaultsItemInformation.ups3DaySelectPct;
            var upsNextDayAirPct = defaultsItemInformation.upsNextDayAirPct;
            var upsNextDayAirSaverPct = defaultsItemInformation.upsNextDayAirSaverPct;
            var ontracGroundPct = defaultsItemInformation.ontracGroundPct;
            var fedexHomeDeliveryPct = defaultsItemInformation.fedexHomeDeliveryPct;
            var fedexGroundPct = defaultsItemInformation.fedexGroundPct;
            var fedex2DayPct = defaultsItemInformation.fedex2DayPct;
            var fedex2ndDayAirPct = defaultsItemInformation.fedex2ndDayAirPct;
            var fedexPriorityOvernightPct = defaultsItemInformation.fedexPriorityOvernightPct;
            var fedexStdOvernightPct = defaultsItemInformation.fedexStdOvernightPct;
            var uspsPriorityMailPct = defaultsItemInformation.uspsPriorityMailPct;
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
            var upsAddlHandlingPackaging = defaultsItemInformation.upsAddlHandlingPackaging;
            var upsOverMaxWeight = defaultsItemInformation.upsOverMaxWeight;
            var upsOverMaxLenGir = defaultsItemInformation.upsOverMaxLenGir;
            var upsOverMaxLength = defaultsItemInformation.upsOverMaxLength;
            var upsOverMaxLimitFee = defaultsItemInformation.upsOverMaxLimitFee;
            var upsLargePackageMinWeight = defaultsItemInformation.upsLargePackageMinWeight;
            var upsDimWeightModifier = defaultsItemInformation.upsDimWeightModifier;
            var upsRateDiscountPct = defaultsItemInformation.upsRateDiscountPct;
            var refundPct = defaultsItemInformation.refundPct;
            var returnShippingPct = defaultsItemInformation.returnShippingPct;
            var restockPct = defaultsItemInformation.restockPct;
            var bulkRefundPct = defaultsItemInformation.bulkRefundPct;
            var bulkRefundCostMarkupPct = defaultsItemInformation.bulkRefundCostMarkupPct;
            var amazonRefundAdminPct = defaultsItemInformation.amazonRefundAdminPct;
            var amazonRefundFeeMax = defaultsItemInformation.amazonRefundFeeMax;
            var fixedOverheadPct = defaultsItemInformation.fixedOverheadPct;

/*                logModule.debug({title: 'Orig Residential Delivery Pct', details: residentialDeliveryPct});
                logModule.debug({title: 'Orig Commercial Delivery Pct', details: commercialDeliveryPct});
                logModule.debug({title: 'upsRemoteDeliveryPct', details: upsRemoteDeliveryPct});
                logModule.debug({title: 'upsExtendedDeliveryPct', details: upsExtendedDeliveryPct});
                logModule.debug({title: 'Orig Refund Pct', details: refundPct});
                logModule.debug({title: 'Orig Return Ship Pct', details: returnShippingPct});
                logModule.debug({title: 'Orig Restock Pct', details: restockPct});
                logModule.debug({title: 'Orig Amz Refund Admin Pct', details: amazonRefundAdminPct});
                logModule.debug({title: 'Orig Amazon Refund Max', details: amazonRefundFeeMax});*/

//*******************************************************
// LANDED COSTS
//*******************************************************
    //Tariff
            var tariffInformationMapping = itemCostingLibrary.tariffInformationSearch(htsCode, countryOfOrigin);

                var tariffInformation = tariffInformationMapping[htsCode, countryOfOrigin];
                var tariffPct = tariffInformation.tariffDutyPct;
                var tariffPerUnit = tariffInformation.tariffDutyPerUnit;
                var tariffTotal = (purchasePrice * (tariffPct * 0.01)) + tariffPerUnit;

                //     logModule.debug({title: 'Tariff Pct Orig', details: tariffPct});
                //     logModule.debug({title: 'Tariff Total Orig', details: tariffTotal});
                //     logModule.debug({title: 'Tariff Total ROUND', details: tariffTotal});
                //
                // logModule.debug({title: 'Tariff Pct ROUND', details: tariffPct});



                rec.setValue({fieldId: 'custrecord_br_cst1_tariff_percentage', value: tariffPct.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_tariff_per_unit', value: tariffPerUnit.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_total_tariff', value: tariffTotal.toFixed(2)});

                logModule.debug({title: 'Total Tariff', details: tariffTotal});


                //*******************************************************
    //Ocean Lanes
            // logModule.debug({title: 'Origin', details: countryOfOrigin});
            var oceanLaneInformationMapping = itemCostingLibrary.oceanLaneInfoSearch(countryOfOrigin);

                var oceanLaneInformation = oceanLaneInformationMapping[countryOfOrigin];
                var oceanLaneWeightedCost = oceanLaneInformation.oceanLaneWeightedCost;

                //if container box is false
                if (!useContainerCapacityQty){
                    //Divide the weighted lane cost by usable CBM then multiply by unit cbm(from default record)
                    oceanLaneWeightedCost = ((oceanLaneWeightedCost / containerLoadableCbmOcean) * unitCBM);
                    // logModule.debug({title: 'Ocean Lane Cost CBM', details: oceanLaneWeightedCost});
                } else {
                    //get the efficient qty amount and divide lane cost by that amount.
                    var efficientContainerQty = containerCapacity40HQ * (containerEfficiencyOcean*0.01);
                    oceanLaneWeightedCost = (oceanLaneWeightedCost/efficientContainerQty);
                    // logModule.debug({title: 'Ocean Lane Cost Container', details: oceanLaneWeightedCost});
                }
                rec.setValue({fieldId: 'custrecord_br_cst1_total_sea_freight', value: oceanLaneWeightedCost.toFixed(2)});

    //*******************************************************
    //Sourcing
            var sourcingInformationMapping = itemCostingLibrary.sourcingInfoSearch(countryOfOrigin);

                var sourcingInformation = sourcingInformationMapping[countryOfOrigin];
                //var sourcingCommissionPct = sourcingInformation.sourcingCommissionPct.toFixed(5);
                var sourcingCommissionPct = (sourcingInformation.sourcingCommissionPct);
                //var sourcingTotal = ((sourcingCommissionPct * 0.01) * purchasePrice).toFixed(5);
                var sourcingTotal = ((sourcingCommissionPct * 0.01) * purchasePrice);
                // logModule.debug({title: 'Total Sourcing', details: sourcingTotal});

                rec.setValue({fieldId: 'custrecord_br_cst1_sourcing_pct', value: sourcingCommissionPct.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_total_sourcing', value: sourcingTotal.toFixed(2)});

    //TOTAL LANDED COST FEES

            var landedCostTotal = (tariffTotal + oceanLaneWeightedCost + sourcingTotal);
            // logModule.debug({title: 'Total Landed Cost', details: landedCostTotal});
            rec.setValue({fieldId: 'custrecord_br_cst1_total_landed_cost', value: landedCostTotal.toFixed(2)});
            //sum up first cost(purchase price) + total landing cost
            var landingCostPriceCalc = (purchasePrice + landedCostTotal);
            rec.setValue({fieldId: 'custrecord_br_cst1_landed_total', value: landingCostPriceCalc.toFixed(2)});

//*******************************************************
// TRANSFER COSTS
//*******************************************************
    //FBM Transfer Lanes
            var transferCategory = 'fbm';
            var fbmTransferInformationMapping = itemCostingLibrary.transferLaneInfoSearch(transferCategory);

            var fbmTransferLaneInformation = fbmTransferInformationMapping[transferCategory];
            var transferLaneWeightedCostFBM = fbmTransferLaneInformation.transferLaneWeightedCost;

            //Divide the weighted lane cost by usable CBM then multiply by unit cbm(from default record)
            transferLaneWeightedCostFBM = ((transferLaneWeightedCostFBM/containerLoadableCbmTransfer) * unitCBM);
            rec.setValue({fieldId: 'custrecord_br_cst1_wgt_transfr_cost_fbm', value: transferLaneWeightedCostFBM.toFixed(2)});

//*******************************************************
    //FBA Transfer Lanes
            transferCategory = 'fba';
            var fbaTransferInformationMapping = itemCostingLibrary.transferLaneInfoSearch(transferCategory);

            var fbaTransferLaneInformation = fbaTransferInformationMapping[transferCategory];
            var transferLaneWeightedCostFBA = fbaTransferLaneInformation.transferLaneWeightedCost;

            //Divide the weighted lane cost by usable CBM then multiply by unit cbm(from default record)
            transferLaneWeightedCostFBA = ((transferLaneWeightedCostFBA/containerLoadableCbmTransfer) * unitCBM);
            rec.setValue({fieldId: 'custrecord_br_cst1_wgt_transfr_cost_fba', value: transferLaneWeightedCostFBA.toFixed(2)});

//*******************************************************
// STORAGE COSTS
//*******************************************************
    //FBA Storage
            //calculate item cubic feet (used for Amazon's calculations)
            var fbaCubicFeet = ((itemLength * itemWidth * itemHeight)/1728);
    // logModule.debug({title: 'Amazon Size Tier', details: amazonSizeTier});
            //use item default costing values to determine FBA Storage Costs. Oversize (ID: 1) and Standard-Size (ID: 2)
            if (amazonSizeTier == 1){
                var fbaStorageCost = (fbaCubicFeet * fbaAvgMonthsStored * fbaStorageFeeOversizeWeighted);
            } else if (amazonSizeTier== 2){
                var fbaStorageCost = (fbaCubicFeet * fbaAvgMonthsStored * fbaStorageFeeStdWeighted);
            }
    // logModule.debug({title: 'FBA Storage Cost', details: fbaStorageCost});
            //set FBA Field Values
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_cubic_feet', value: fbaCubicFeet.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_storage_cost', value: fbaStorageCost.toFixed(2)});

//*******************************************************
    //FBM Storage -defaulting to zero for now (concept of unlimited Space.
        var fbmStorageCost = 0;
            rec.setValue({fieldId: 'custrecord_br_cst1_fbm_storage_cost', value: fbmStorageCost});

//*******************************************************
// FULFILLMENT COSTS
//*******************************************************
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
                var fbaFulfillFeeId = fbaFulfillInformation.fbaFulfillFeeId;
                var fbaFulfillBaseFee = fbaFulfillInformation.fbaFulfillBaseFee;
                var fbaFulfillPeakFee = fbaFulfillInformation.fbaFulfillPeakFee;
                var fbaFulfillFeePerPound = fbaFulfillInformation.fbaFulfillFeePerPound;
                var fbaFulfillPerPoundTrigger = fbaFulfillInformation.fbaFulfillPerPoundTrigger;


                // logModule.debug({title: 'Item Actual Weight', details: itemWeight});
                // logModule.debug({title: 'Amazon Dim Weight', details: amazonDimWeight});
                // logModule.debug({title: 'FBA Weight', details: fbaWeight});
                logModule.debug({title: 'FBA Base Fee', details: fbaFulfillBaseFee});
                logModule.debug({title: 'FBA Peak Fee', details: fbaFulfillPeakFee});
                logModule.debug({title: 'Peak Surcharge Active', details: fbaPeakSurchActive});


        //Logic - Calculate which fees apply to the item
            //Base or Peak Fees Applied
                var fbaFulfillFee = 0;
        // logModule.debug({title: 'FBA Base Fee', details: fbaFulfillBaseFee});
        // logModule.debug({title: 'FBA Peak Fee', details: fbaFulfillPeakFee});
        // logModule.debug({title: 'Peak Surcharge Active', details: fbaPeakSurchActive});

                if (fbaPeakSurchActive === true){
                    fbaFulfillFee = fbaFulfillPeakFee;
                    rec.setValue({fieldId: 'custrecord_br_cst1_fba_peak_surch_active', value: true});
                } else {
                    fbaFulfillFee = fbaFulfillBaseFee;
                    rec.setValue({fieldId: 'custrecord_br_cst1_fba_peak_surch_active', value: false});
                }
        // logModule.debug({title: 'FBA Final Fee', details: fbaFulfillFee});


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

                // logModule.debug({title: 'Amazon Per Pound Fees', details: amzPerPoundFees});

            //Set FBA Fulfillment values
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_dim_wt', value: amazonDimWeight.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_fulfill_rec', value: fbaFulfillFeeId});
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_base_fee', value: fbaFulfillFee.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_addl_per_lb', value: amzPerPoundFees.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_fuelsrchg_pct', value: amazonFuelSurchargePct.toFixed(2)});
            var fbaFulfillSubtotal = (fbaFulfillBaseFee + amzPerPoundFees);
            var amazonFuelSurchargeAmt = ((amazonFuelSurchargePct * 0.01) * fbaFulfillSubtotal);
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_fuelsrchg_amt', value: amazonFuelSurchargeAmt.toFixed(2)});
            var fbaFulfillTotal = (fbaFulfillSubtotal+ amazonFuelSurchargeAmt);

            //Set Total FBA Fulfillment Fees value
            rec.setValue({fieldId: 'custrecord_br_cst1_fba_total_fulfill', value: fbaFulfillTotal.toFixed(2)});

//*******************************************************
    //FBM Picking

        var itemPickCostFbm = (fbmPickingAmt * unitCBM);

        rec.setValue({fieldId: 'custrecord_br_cst1_fbm_picking_cost', value: itemPickCostFbm.toFixed(2)});

//*******************************************************
    //FBM Shipping (Delivered Cost Record)
            //round item dimensions
                var fbmItemLength = Math.round(itemLength);
                var fbmItemWidth = Math.round(itemWidth);
                var fbmItemHeight = Math.round(itemHeight);
                var fbmItemLengthGirth = (fbmItemLength + (2 * fbmItemWidth) + (2 * fbmItemHeight));



            //Calculate UPS Dim Weight
            var fbmDimWeight = (Math.ceil((fbmItemLength * fbmItemWidth * fbmItemHeight) / upsDimWeightModifier));
                // logModule.debug({title: 'firstfbaDimWt', details: fbmDimWeight});
                // logModule.debug({title: 'itemCeilWt', details: itemWeightCeil});


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
                // logModule.debug({title: 'FinalFBMWeight', details: fbmWeight});
                // logModule.debug({title: 'Item Weight Ceil', details: itemWeightCeil});

            //Call Delivered Cost Search
            var fbmDeliveredCostMapping = itemCostingLibrary.fbmShippingInfoSearch(fbmWeight);
                logModule.audit({title: 'FBM Shipping Search Run'});

            //Import Search Values
            var fbmDeliveredCostInformation = fbmDeliveredCostMapping[fbmWeight];
                //var deliveredInternalId = fbmDeliveredCostInformation.internalId;
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

                    // logModule.debug({title: 'Internal ID', details: internalId});
                    // logModule.debug({title: 'shippingBaseFee', details: shippingBaseFee});
                    // logModule.debug({title: 'shippingResidentialFee', details: shippingResidentialFee});
                    // logModule.debug({title: 'shippingOverMaxLimitFee', details: shippingOverMaxLimitFee});
                    // logModule.debug({title: 'shippingPeakSurchargeLarge', details: shippingPeakSurchargeLarge});
                    // logModule.debug({title: 'shippingPeakSurchargeAH', details: shippingPeakSurchargeAH});
                    // logModule.debug({title: 'shippingAHWeight', details: shippingAHWeight});
                    // logModule.debug({title: 'shippingAHLenGirth', details: shippingAHLenGirth});
                    // logModule.debug({title: 'shippingAHLength', details: shippingAHLength});
                    // logModule.debug({title: 'shippingAHWidth', details: shippingAHWidth});
                    // logModule.debug({title: 'shippingAHPackaging', details: shippingAHPackaging});
                    // logModule.debug({title: 'shippingLgPkgLenGirthRes', details: shippingLgPkgLenGirthRes});
                    // logModule.debug({title: 'shippingLgPkgLengthRes', details: shippingLgPkgLengthRes});
                    // logModule.debug({title: 'shippingLgPkgLenGirthCom', details: shippingLgPkgLenGirthCom});
                    // logModule.debug({title: 'shippingLgPkgLengthCom', details: shippingLgPkgLengthCom});

                upsExtendedDeliveryPct = (upsExtendedDeliveryPct * 0.01);
                upsRemoteDeliveryPct = (upsRemoteDeliveryPct * 0.01);
                residentialDeliveryPct = (residentialDeliveryPct * 0.01);
                commercialDeliveryPct = (commercialDeliveryPct * 0.01);
                    // logModule.debug({title: 'Residential Delivery Pct', details: residentialDeliveryPct});
                    // logModule.debug({title: 'Commercial Delivery Pct', details: commercialDeliveryPct});
                    // logModule.debug({title: 'upsRemoteDeliveryPct', details: upsRemoteDeliveryPct});
                    // logModule.debug({title: 'upsExtendedDeliveryPct', details: upsExtendedDeliveryPct});
                    // logModule.debug({title: 'upsRemoteDeliverySurcharge', details: upsRemoteDeliverySurcharge});

                // logModule.debug({title: 'Original AH Weight Fee', details: shippingAHWeight});

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

                // logModule.debug({title: 'IF/THEN AH Weight Fee', details: shippingAHWeight});

            }

                // logModule.debug({title: 'FINAL AH Weight Fee', details: shippingAHWeight});


                //Fees that apply to all shipments
                var shippingPeakSurchargeTotal = (upsPeakSurchargeStd + upsPeakSurchargeHoliday);
                var shippingExtDelvAreaSurch = (upsExtendedDeliveryPct * ((residentialDeliveryPct * upsExtendedDeliverySurchargeRes) + (commercialDeliveryPct * upsExtendedDeliverySurchargeCom )));
                var shippingRemoteDelvAreaSurch = (upsRemoteDeliveryPct * upsRemoteDeliverySurcharge);

                    // logModule.debug({title: 'shippingPeakSurchargeTotal', details: shippingPeakSurchargeTotal});
                    // logModule.debug({title: 'shippingExtDelvAreaSurch', details: shippingExtDelvAreaSurch});
                    // logModule.debug({title: 'shippingRemoteDelvAreaSurch', details: shippingRemoteDelvAreaSurch});

            //Large Package fee check
                //var shipCostLargePackage = 0;
                var shipCostLgPkgLenGirthRes = 0;
                var shipCostLgPkgLenGirthCom = 0;
                var shipCostLgPkgLengthRes = 0;
                var shipCostLgPkgLengthCom = 0;

            //Large Package Fee Check
                // set Large Package Peak Surcharge
                var shipCostPeakSurchLarge = shippingPeakSurchargeLarge;
                    // logModule.debug({title: 'shipCostPeakSurchLarge', details: shipCostPeakSurchLarge});

                //Run through Large Package Triggers (reverse priority) and set record informational checkboxes
                //Priority 2: Large Package Length
                if (fbmItemLength >= upsLargeLengthRes){
                    shipCostLgPkgLengthRes = shippingLgPkgLengthRes;
                    rec.setValue({fieldId: 'custrecord_br_cst1_res_length_fbm', value: true});
                }
                if (fbmItemLength >= upsLargeLengthCom){
                    shipCostLgPkgLengthCom = shippingLgPkgLengthCom;
                    rec.setValue({fieldId: 'custrecord_br_cst1_com_length_fbm', value: true});
                }
                        // logModule.debug({title: 'shipCostLgPkgLengthRes', details: shipCostLgPkgLengthRes});
                        // logModule.debug({title: 'shipCostLgPkgLengthCom', details: shipCostLgPkgLengthCom});

                var shipCostLargePackage = (shipCostLgPkgLengthRes + shipCostLgPkgLengthCom);
                    // logModule.debug({title: 'FIRSTshipCostLargePackage', details: shipCostLargePackage});

                //Priority 1: Large Package Length + Girth
                if (fbmItemLengthGirth >= upsLargeLenGirRes) {
                    shipCostLgPkgLenGirthRes = shippingLgPkgLenGirthRes;
                    rec.setValue({fieldId: 'custrecord_br_cst1_res_len_girth_fbm', value: true});
                }
                if (fbmItemLengthGirth >= upsLargeLenGirCom) {
                    shipCostLgPkgLenGirthCom = shippingLgPkgLenGirthCom;
                    rec.setValue({fieldId: 'custrecord_br_cst1_com_len_girth_fbm', value: true});
                }
                        // logModule.debug({title: 'NEWshipCostLgPkgLenGirthRes', details: shipCostLgPkgLenGirthRes});
                        // logModule.debug({title: 'NEWshipCostLgPkgLenGirthCom', details: shipCostLgPkgLenGirthCom});

                //determine which prioritized amount is used on this item
                if ((shipCostLgPkgLenGirthRes + shipCostLgPkgLenGirthCom) > (shipCostLgPkgLengthRes + shipCostLgPkgLengthCom)){
                    shipCostLargePackage = (shipCostLgPkgLenGirthRes + shipCostLgPkgLenGirthCom);
                }
                        // logModule.debug({title: 'NEWshipCostLargePackage Final', details: shipCostLargePackage});

                //clear large peak surcharge if large package fee doesn't apply
                if (shipCostLargePackage <= 0){
                    shipCostPeakSurchLarge = 0
                }
                    // logModule.debug({title: 'FINALshipCostPeakSurchLarge', details: shipCostPeakSurchLarge});


            //Additional Handling fee check
                var shipCostAdditionalHandling = 0;

                // set Additional Handling Peak Surch
                var shipCostPeakSurchAH = shippingPeakSurchargeAH;

                //Run through Additional Handling (reverse priority) and check record informational boxes

                //Priority 5: Packaging  -- WE WON'T TRIGGER THIS UNLESS WE HAVE ITEMS THAT *REQUIRE* MORE THAN 1 BOX
        /*                if (maxQtyPerLabel > upsAddlHandlingPackaging) {   //note - this is the wrong formula if we ever need this calc.
                            shipCostAdditionalHandling = shippingAHPackaging;
                            rec.setValue({fieldId: 'custrecord_br_cst1_ah_pkgng_fbm', value: true});
                        }*/
                                // logModule.debug({title: 'costAHPackaging', details: shipCostAdditionalHandling});

                //Priority 4: Width (2nd longest dimension)
                if (fbmItemWidth > upsAddlHandlingWidth){
                    shipCostAdditionalHandling = shippingAHWidth;
                    rec.setValue({fieldId: 'custrecord_br_cst1_ah_width_fbm', value: true});
                }
                        // logModule.debug({title: 'costAHWidth', details: shipCostAdditionalHandling});

                //Priority 3: Length (longest dimension)
                if (fbmItemLength > upsAddlHandlingLength){
                    shipCostAdditionalHandling = shippingAHLength;
                    rec.setValue({fieldId: 'custrecord_br_cst1_ah_length_fbm', value: true});
                }
                        // logModule.debug({title: 'costAHLength', details: shipCostAdditionalHandling});

                //Priority 2: Length + Girth
                if (fbmItemLengthGirth > upsAddlHandlingLenGir){
                    shipCostAdditionalHandling = shippingAHLenGirth;
                    rec.setValue({fieldId: 'custrecord_br_cst1_ah_len_girth_fbm', value: true});
                }
                        // logModule.debug({title: 'costAHLenGirth', details: shipCostAdditionalHandling});

                //Priority 1: Weight
                if (itemWeightCeil > upsAddlHandlingWeight){
                    shipCostAdditionalHandling = shippingAHWeight;
                    rec.setValue({fieldId: 'custrecord_br_cst1_ah_weight_fbm', value: true});
                }
                        // logModule.debug({title: 'costAHWeight', details: shipCostAdditionalHandling});

                //If Large Package Fee applies, Additional Handling Fee is 0 (Large Package Fees take priority as an either/or)
                if (shipCostLargePackage > 0){
                    shipCostAdditionalHandling = 0
                }
                        // logModule.debug({title: 'Additional Handling Applied', details: shipCostAdditionalHandling});

                //clear AH peak surcharge if additional handling fee doesn't apply
                if (shipCostAdditionalHandling <= 0){
                    shipCostPeakSurchAH = 0
                }
                        // logModule.debug({title: 'AH: shipCostPeakSurchAH', details: shipCostPeakSurchAH});


            //Over Maximum Limits Fee Check
                var shipCostMaxLimitFee = 0;  //was costMaxLimitFee

                //If any of the triggers is met, add max limit fee.
                if (itemWeightCeil > upsOverMaxWeight){
                    shipCostMaxLimitFee = upsOverMaxLimitFee;
                    record.setValue({fieldId: 'custrecord_br_cst1_max_weight_fbm', value: true})
                }
                if (fbmItemLength > upsOverMaxLength){
                    shipCostMaxLimitFee = upsOverMaxLimitFee;
                    record.setValue({fieldId: 'custrecord_br_cst1_max_length_fbm', value: true})
                }
                if (fbmItemLengthGirth > upsOverMaxLenGir){
                    shipCostMaxLimitFee = upsOverMaxLimitFee;
                    record.setValue({fieldId: 'custrecord_br_cst1_max_len_girth_fbm', value: true})
                }
                    // logModule.debug({title: 'shipCostMaxLimitFee', details: shipCostMaxLimitFee});


            //Set FMB Shipping Values
                    logModule.audit({title: 'Start writing Values'});

                //Applies to all
                rec.setValue({fieldId: 'custrecord_br_cst1_base_fee_fbm', value: shippingBaseFee.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_residential_fee_fbm', value: shippingResidentialFee.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_fuel_surch_pct_fbm', value: upsfuelSurchargeDefaultPct.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_total_peak_surch_fbm', value: shippingPeakSurchargeTotal.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_area_surcharge_fbm', value: shippingExtDelvAreaSurch.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_rem_area_surchge_fbm', value: shippingRemoteDelvAreaSurch.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_other_surcharges_fbm', value: upsOtherSurcharge.toFixed(2)});
                //Large Package
                rec.setValue({fieldId: 'custrecord_br_cst1_peak_lgpkg_fbm', value: shipCostPeakSurchLarge.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_lg_package_fee_fbm', value: shipCostLargePackage.toFixed(2)});
                //Additional Handling
                rec.setValue({fieldId: 'custrecord_br_cst1_peak_addlhnd_fbm', value: shipCostPeakSurchAH.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_addl_handling_fbm', value: shipCostAdditionalHandling.toFixed(2)});
                //Over Maximum Limits
                rec.setValue({fieldId: 'custrecord_br_cst1_overmaxlimit_fbm', value: shipCostMaxLimitFee.toFixed(2)});

                //Calculate total fees and total cost (fees * fuel surcharge %)
        logModule.audit({title: 'Calculate Values'});

                var fbmShippingFeesTotal = (shippingBaseFee + shippingResidentialFee + shippingPeakSurchargeTotal + shippingExtDelvAreaSurch + shippingRemoteDelvAreaSurch + upsOtherSurcharge + shipCostAdditionalHandling + shipCostPeakSurchAH + shipCostLargePackage + shipCostPeakSurchLarge + shipCostMaxLimitFee);

                var upsFuelSurchargeMultiplier = (upsfuelSurchargeDefaultPct * 0.01);
                var upsFuelSurchargeAmount = (upsFuelSurchargeMultiplier * fbmShippingFeesTotal);
                    // logModule.debug({title: 'FBM Shipping Fees Total', details: fbmShippingFeesTotal});
                    // logModule.debug({title: 'UPS Fuel Surcharge Amt', details: upsFuelSurchargeAmount});
                    // logModule.debug({title: 'Item Picking Cost FBM', details: itemPickCostFbm});

                var totalFBMShippingCost = (fbmShippingFeesTotal + upsFuelSurchargeAmount);
                var totalFbmFulfillmentCost = (totalFBMShippingCost + itemPickCostFbm);
                    // logModule.debug({title: 'total FBM Fulfillment Cost', details: totalFbmFulfillmentCost});

                //Set total FBM Shipping Fees Values
        logModule.audit({title: 'Set Calculated Values'});
                rec.setValue({fieldId: 'custrecord_br_cst1_total_delvd_fees_fbm', value: fbmShippingFeesTotal.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_fbm_fuelsrchg_amt', value: upsFuelSurchargeAmount.toFixed(2)});
                rec.setValue({fieldId: 'custrecord_br_cst1_total_delvd_costs_fbm', value: totalFBMShippingCost.toFixed(2)});

                // set total FBM fulfillment fees
                rec.setValue({fieldId: 'custrecord_br_cst1_fbm_total_fulfill', value: totalFbmFulfillmentCost.toFixed(2)});

//*******************************************************
// SOLD COSTS
//*******************************************************
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

            //set Field Values
            rec.setValue({fieldId: 'custrecord_br_cst1_salecomm_pct_amt_fbm', value: fbmCommissionPctCost.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_salecomm_per_unit_fbm', value: fbmCommissionPerUnitCost.toFixed(2)});

        //FBA
            itemClassification = 'fba';
            var fbaSalesCommissionMapping = itemCostingLibrary.salesCommissionInfoSearch(itemClassification);

            var fbaSalesCommissionInformation = fbaSalesCommissionMapping[itemClassification];
            var fbaSalesCommissionWeightedPct = fbaSalesCommissionInformation.salesCommissionWeightedPct;
            var fbaSalesCommissionWeightedPerUnit = fbaSalesCommissionInformation.salesCommissionWeightedPerUnit;

            //Calculate item Commission Cost values
            var fbaCommissionPctCost = ((fbaSalesCommissionWeightedPct * 0.01) * basePrice);
            var fbaCommissionPerUnitCost = (fbaSalesCommissionWeightedPerUnit * basePrice);
            //set Field Values
            rec.setValue({fieldId: 'custrecord_br_cst1_salecomm_pct_amt_fba', value: fbaCommissionPctCost.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_salecomm_per_unit_fba', value: fbaCommissionPerUnitCost.toFixed(2)});

        //Bulk
            itemClassification = 'bulk';
            var bulkSalesCommissionMapping = itemCostingLibrary.salesCommissionInfoSearch(itemClassification);

            var bulkSalesCommissionInformation = bulkSalesCommissionMapping[itemClassification];
            var bulkSalesCommissionWeightedPct = bulkSalesCommissionInformation.salesCommissionWeightedPct;
            var bulkSalesCommissionWeightedPerUnit = bulkSalesCommissionInformation.salesCommissionWeightedPerUnit;

            //Calculate item Commission Cost values
            var bulkCommissionPctCost = ((bulkSalesCommissionWeightedPct * 0.01) * basePrice);
            var bulkCommissionPerUnitCost = (bulkSalesCommissionWeightedPerUnit * basePrice);

            //set Field Values
            rec.setValue({fieldId: 'custrecord_br_cst1_salecomm_pct_amt_blk', value: bulkCommissionPctCost.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_salecomm_per_unit_blk', value: bulkCommissionPerUnitCost.toFixed(2)});


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

    // Set Field Values
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_admin_fee', value: refundAmazonAdminFee.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_inventory_loss', value: refundInventoryLoss.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_unrecover_inv', value: refundUnrecoverableInventory.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_pick_loss_fbm', value: refundPickLossFBM.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_flfil_loss_fba', value: refundFulfillLossFBA.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_label_loss_fbm', value: refundLabelLossFBM.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_return_ship', value: refundReturnShipCost.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_inv_cost_recov', value: refundInventoryCostRecovery.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_total_fbm', value: refundTotalFBM.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_total_fba', value: refundTotalFBA.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_refund_total_bulk', value: refundTotalBulk.toFixed(2)});


    //Set Total Sold Cost Values
        var fbmSoldCostTotal = (refundTotalFBM + fbmCommissionPctCost + fbmCommissionPerUnitCost);
        var fbaSoldCostTotal = (refundTotalFBA + fbaCommissionPctCost + fbaCommissionPerUnitCost);
        var bulkSoldCostTotal = (refundTotalBulk + bulkCommissionPctCost + bulkCommissionPerUnitCost);

        rec.setValue({fieldId: 'custrecord_br_cst1_total_sold_costs_fbm', value: fbmSoldCostTotal.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_total_sold_costs_fba', value: fbaSoldCostTotal.toFixed(2)});
        rec.setValue({fieldId: 'custrecord_br_cst1_total_sold_costs_blk', value: bulkSoldCostTotal.toFixed(2)});



//*******************************************************
//FIXED OVERHEAD
//*******************************************************
    //Calculate cost for item and set field value on record
        var fixedOverheadAmount = ((fixedOverheadPct * 0.01) * purchasePrice);
        // logModule.debug({title: 'Fixed Overhead Amt', details: fixedOverheadAmount});

        rec.setValue({fieldId: 'custrecord_br_cst1_fixed_overhead_amount', value: fixedOverheadAmount.toFixed(2)});


//*******************************************************
// FINAL CALCULATIONS
//*******************************************************


    //FBM
        //Contribution Margin Costs (sum of)
            //Purchase Price
            //Total Landed Cost
            //FBM Weighted Transfer Costs
            //FBM Storage Cost
            //Total FBM Fulfillment Fees
            //FBM Sold Costs Total
        var fbmContributionMarginCosts = (purchasePrice + landedCostTotal + transferLaneWeightedCostFBM + fbmStorageCost + totalFbmFulfillmentCost + fbmSoldCostTotal);
            // logModule.debug({title: 'FBM Contribution Margin Costs', details: fbmContributionMarginCosts});

        //Contribution Margin (Amount)
            //Base Price - Contribution Margin Costs
        var fbmContributionMarginAmt = (basePrice - fbmContributionMarginCosts);
           // logModule.debug({title: 'FIRST FBM Contribution Margin Amt', details: fbmContributionMarginAmt});
           // logModule.debug({title: 'FIRST FBM Contribution Margin Amt +1', details: fbmContributionMarginAmt + 1});

        //Contribution Margin Percent
            //Contribution Margin divided by Base Price
        var fbmContributionMarginPct = ((fbmContributionMarginAmt / basePrice) * 100);
            // logModule.debug({title: 'FBM Contribution Margin Pct', details: fbmContributionMarginPct});


        //Gross Margin Costs
            //Contribution Margin Costs + Fixed Overhead Amt
        var fbmGrossMarginCosts = (fbmContributionMarginCosts + fixedOverheadAmount);
            // logModule.debug({title: 'FBM Gross Margin Costs', details: fbmGrossMarginCosts});
        //Gross Margin (Amount)
            //Base Price - Gross Margin
        var fbmGrossMarginAmt = (basePrice - fbmGrossMarginCosts)
            // logModule.debug({title: 'FBM Gross Margin Amt', details: fbmGrossMarginAmt});

        //Gross Margin Percent
            //Gross Margin divided by Base Price
        var fbmGrossMarginPct = ((fbmGrossMarginAmt / basePrice) * 100);
            // logModule.debug({title: 'FBM Gross Margin Pct', details: fbmGrossMarginPct});


    //FBA
        //Contribution Margin Costs (sum of)
            //Purchase Price
            //Total Landed Cost
            //FBA Weighted Transfer Costs
            //FBA Storage Cost
            //Total FBA Fulfillment Fees
            //FBA Sold Costs Total
        var fbaContributionMarginCosts = (purchasePrice + landedCostTotal + transferLaneWeightedCostFBA + fbaStorageCost + fbaFulfillTotal + fbaSoldCostTotal);

        // logModule.debug({title: 'FBA Contribution Margin Costs', details: fbaContributionMarginCosts});

        //Contribution Margin (Amount)
            //Base Price - Contribution Margin Costs
        var fbaContributionMarginAmt = (basePrice - fbaContributionMarginCosts);
        // logModule.debug({title: 'FIRST FBA Contribution Margin Amt', details: fbaContributionMarginAmt});

        //Contribution Margin Percent
            //Contribution Margin divided by Base Price
        var fbaContributionMarginPct = ((fbaContributionMarginAmt / basePrice) * 100);
        // logModule.debug({title: 'FBA Contribution Margin Pct', details: fbaContributionMarginPct});


        //Gross Margin Costs
            //Contribution Margin Costs + Fixed Overhead Amt
        var fbaGrossMarginCosts = (fbaContributionMarginCosts + fixedOverheadAmount);
        // logModule.debug({title: 'FBA Gross Margin Costs', details: fbaGrossMarginCosts});

        //Gross Margin (Amount)
            //Base Price - Gross Margin
        var fbaGrossMarginAmt = (basePrice - fbaGrossMarginCosts)
        // logModule.debug({title: 'FBA Gross Margin Amt', details: fbaGrossMarginAmt});

        //Gross Margin Percent
            //Gross Margin divided by Base Price
        var fbaGrossMarginPct = ((fbaGrossMarginAmt / basePrice) * 100);
        // logModule.debug({title: 'FBA Gross Margin Pct', details: fbaGrossMarginPct});


    //BULK
        //Conditional logic for if we or customer pays Tariff and/or Ocean Freights
            //Get field values for customer pays checkboxes
        var customerPaysTariff = rec.getValue({fieldId: 'custrecord_br_cst1_customer_pays_tariff'});
        var customerPaysSeaFreight = rec.getValue({fieldId: 'custrecord_br_cst1_custm_pays_seafreight'});
            // logModule.debug({title: 'Customer Pays Tariff', details: customerPaysTariff});
            // logModule.debug({title: 'Customer Pays Sea Freight', details: customerPaysSeaFreight});

            //tariff
            if (customerPaysTariff === true) {
                var bulkTariffTotal = 0;
            } else {
                bulkTariffTotal = tariffTotal;
            }
            //sea freight
            if (customerPaysSeaFreight === true){
                var bulkOceanLaneCost = 0
            } else {
                bulkOceanLaneCost = oceanLaneWeightedCost;
            }

            // add up landed cost total for bulk items
            var bulkLandedCostTotal = (sourcingTotal + bulkTariffTotal + bulkOceanLaneCost);
                // logModule.debug({title: 'Bulk Landed Cost Total', details: bulkLandedCostTotal});

        //Contribution Margin Costs (sum of)
            //Purchase Price
            //Bulk Item Landed Cost Total
            //Bulk Sold Costs Total
        var bulkContributionMarginCosts = (purchasePrice + bulkLandedCostTotal + bulkSoldCostTotal);
                // logModule.debug({title: 'Bulk Contribution Margin Costs', details: bulkContributionMarginCosts});

        //Contribution Margin (Amount)
            //Base Price - Contribution Margin Costs
        var bulkContributionMarginAmt = (basePrice - bulkContributionMarginCosts);
            // logModule.debug({title: 'Bulk Contribution Margin Amt', details: bulkContributionMarginAmt});

        //Contribution Margin Percent
            //Contribution Margin divided by Base Price
        var bulkContributionMarginPct = ((bulkContributionMarginAmt / basePrice) * 100);
            // logModule.debug({title: 'Bulk Contribution Margin Pct', details: bulkContributionMarginPct});


        //Gross Margin Costs
            //Contribution Margin Costs + Fixed Overhead Amt
        var bulkGrossMarginCosts = (bulkContributionMarginCosts + fixedOverheadAmount);
            // logModule.debug({title: 'Bulk Gross Margin Costs', details: bulkGrossMarginCosts});

        //Gross Margin (Amount)
            //Base Price - Gross Margin
        var bulkGrossMarginAmt = (basePrice - bulkGrossMarginCosts)
            // logModule.debug({title: 'Bulk Gross Margin Amt', details: bulkGrossMarginAmt});

        //Gross Margin Percent
            //Gross Margin divided by Base Price
        var bulkGrossMarginPct = ((bulkGrossMarginAmt / basePrice) * 100);
            // logModule.debug({title: 'Bulk Gross Margin Pct', details: bulkGrossMarginPct});

                // logModule.debug({title: 'fba margin amount', details: fbaContributionMarginAmt});
                // logModule.debug({title: 'fbm margin amount', details: fbmContributionMarginAmt});
                // logModule.debug({title: 'fba - fbm', details: (fbaContributionMarginAmt - fbmContributionMarginAmt)});


    //Set Calculated Margin Values on Form

        if (fbaItem === true) {          //FBA Item
                //set Primary to 'FBA'
            rec.setValue({fieldId: 'custrecord_br_cst1_primary_class', value: 'FBA'});
                //set Primary Fields
            rec.setValue({fieldId: 'custrecord_br_cst1_contrib_margin_costs', value: fbaContributionMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_contribution_margin', value: fbaContributionMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_contrib_margin_pct', value: fbaContributionMarginPct.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_total_unit_costs', value: fbaGrossMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_gross_margin', value: fbaGrossMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_gross_margin_pct', value: fbaGrossMarginPct.toFixed(2)});

                //Set Alternate to 'FBM'
            rec.setValue({fieldId: 'custrecord_br_cst1_alternate', value: 'FBM'});
            //set Alternate Fields
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin_costs', value: fbmContributionMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin', value: fbmContributionMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin_pct', value: fbmContributionMarginPct.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_unit_costs', value: fbmGrossMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_gross_margin', value: fbmGrossMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_gross_margin_pct', value: fbmGrossMarginPct.toFixed(2)});

            //Check Margin Review Box if Alternate (FBM) Margin > Primary (FBA) Margin


            if (fbmContributionMarginAmt > fbaContributionMarginAmt) {
                rec.setValue({fieldId: 'custrecord_br_cst1_margin_review', value: true});
           } else {
                rec.setValue({fieldId: 'custrecord_br_cst1_margin_review', value: false});
            }

        } else if (bulkItem === true) {  //Bulk Item
                //set Primary to 'Bulk'
            rec.setValue({fieldId: 'custrecord_br_cst1_primary_class', value: 'Bulk'});
                //set Primary Fields
            rec.setValue({fieldId: 'custrecord_br_cst1_contrib_margin_costs', value: bulkContributionMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_contribution_margin', value: bulkContributionMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_contrib_margin_pct', value: bulkContributionMarginPct.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_total_unit_costs', value: bulkGrossMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_gross_margin', value: bulkGrossMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_gross_margin_pct', value: bulkGrossMarginPct.toFixed(2)});

                //Set Alternate to 'FBM'
            rec.setValue({fieldId: 'custrecord_br_cst1_alternate', value: 'FBM'});
                //set Alternate Fields
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin_costs', value: fbmContributionMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin', value: fbmContributionMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin_pct', value: fbmContributionMarginPct.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_unit_costs', value: fbmGrossMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_gross_margin', value: fbmGrossMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_gross_margin_pct', value: fbmGrossMarginPct.toFixed(2)});

        }  else {                       //FBM Item (neither of above)
                //set Primary to 'FBM'
            rec.setValue({fieldId: 'custrecord_br_cst1_primary_class', value: 'FBM'});
                //set Primary Fields
            rec.setValue({fieldId: 'custrecord_br_cst1_contrib_margin_costs', value: fbmContributionMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_contribution_margin', value: fbmContributionMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_contrib_margin_pct', value: fbmContributionMarginPct.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_total_unit_costs', value: fbmGrossMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_gross_margin', value: fbmGrossMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_gross_margin_pct', value: fbmGrossMarginPct.toFixed(2)});

                //Set Alternate to 'FBA'
            rec.setValue({fieldId: 'custrecord_br_cst1_alternate', value: 'FBA'});
                //Set Alternate Fields
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin_costs', value: fbaContributionMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin', value: fbaContributionMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_margin_pct', value: fbaContributionMarginPct.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_unit_costs', value: fbaGrossMarginCosts.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_gross_margin', value: fbaGrossMarginAmt.toFixed(2)});
            rec.setValue({fieldId: 'custrecord_br_cst1_alt_gross_margin_pct', value: fbaGrossMarginPct.toFixed(2)});

           //Check Margin Review Box if Alternate (FBA) Margin > Primary (FBM) Margin
            if (fbaContributionMarginAmt > fbmContributionMarginAmt) {
                rec.setValue({fieldId: 'custrecord_br_cst1_margin_review', value: true});
            } else {
                rec.setValue({fieldId: 'custrecord_br_cst1_margin_review', value: false});
            }

        }

            } catch (e) {
                logModule.error('onAction', JSON.parse(JSON.stringify(e)));
            }
        }

/*    function roundTwo(num) {
        return +(Math.round(num + "e+2")  + "e-2");
    }
    */

/*    function roundTwoNeg(num) {
        return +(Math.sign(num) * (Math.round(Math.abs(num) + "e+2")  + "e-2"));
    }
    
    function roundFiveNeg(num) {
        return +(Math.sign(num) * (Math.round(Math.abs(num) + "e+5")  + "e-5"));
    }*/

        exports.onAction = onAction;
        return exports;
    }
);
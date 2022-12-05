/*
 ***********************************************************************
 * Author:		Mark Chuberka
 * Date:		2022-08-16
 * File:		BR_LIB_Item_Costing.js
 * Version:     0.9
 ***********************************************************************/

/**
 *@NApiVersion 2.0
 *@NModuleScope SameAccount
 */

define(['N/log', 'N/error', 'N/record', 'N/search'],

    function (logModule, errorModule, recordModule, searchModule){

//*******************************************************
// ITEM INFORMATION
//*******************************************************
    /**
     * The following function looks up information from the Inventory Item Record and populates the reference fields on the Item Costing Record. There is only ONE item record used (1:1)
     * Filter: Item Internal ID
     * Retrieve: Item costs, dimensions, and various classification fields
     */
        function itemInformationSearch(itemId){
            var itemMap = {};

            //search for Item Values
            var itemFields = searchModule.create({
                type: 'inventoryitem',
                filters:
                    [
                        ['type','anyof','InvtPart'],
                        'AND',
                        ['isinactive','is','F'],
                        'AND',
                        ['internalid','anyof', itemId]
                    ],
                columns:
                    [
                        searchModule.createColumn({name: 'baseprice'}), //selling price
                        searchModule.createColumn({name: 'custitemcountry_of_origin'}), //country of origin
                        searchModule.createColumn({name: 'custitem_fa_amz_fba'}), //fba item
                        searchModule.createColumn({name: 'custitem_bulk_item'}), //bulk item
                        searchModule.createColumn({name: 'custitem_htscode'}), //hts code
                        searchModule.createColumn({name: 'custitem3'}), //unit cbm
                        searchModule.createColumn({name: 'cost'}), //purchase price
                        searchModule.createColumn({name: 'custitem_br_tariff_primary'}), //tariff
                        searchModule.createColumn({name: 'weight'}), //item weight
                        searchModule.createColumn({name: 'custitemsku_dim_len'}), //item length
                        searchModule.createColumn({name: 'custitemsku_dim_wid'}), //item width
                        searchModule.createColumn({name: 'custitemsku_dim_ht'}), //item height
                        searchModule.createColumn({name: 'custitem_br_sell_unit_dimensional_wt'}), //item dimensional wt
                        searchModule.createColumn({name: 'custitem_br_amazon_size_tier'}), //amazon size tier
                        searchModule.createColumn({name: 'custitemmax_qty_label'}), //max qty per label
                        searchModule.createColumn({name: 'displayname'}), //Item DisplayName
                        searchModule.createColumn({name: 'vendor'}), //Item Preferred Vendor
                        searchModule.createColumn({name: 'cseg4'}), //Item Category
                        searchModule.createColumn({name: 'cseg5'}), //Item Family
                        searchModule.createColumn({name: 'custitem_product_status'}), //Product Status
                        searchModule.createColumn({name: 'custitem_fa_amz_asin'}), //Amazon ASIN
                        searchModule.createColumn({name: 'upccode'}), //UPC
                        searchModule.createColumn({name: 'custitem_container_capacity_40hq'}), //Container Capacity 40HQ
                        searchModule.createColumn({name: 'custitem_br_use_container_qty_for_cost'}), //Use Container for Costing
                    ]
            });
            var itemSearch = itemFields.run();

            var itemFirstResult = itemSearch.getRange({
                start: 0,
                end: 1
            }) [0];
            var basePrice = parseFloat(itemFirstResult.getValue({name: 'baseprice'}));
            var countryOfOrigin = itemFirstResult.getValue ({name: 'custitemcountry_of_origin'});
            var fbaItem = itemFirstResult.getValue({name: 'custitem_fa_amz_fba'});
            var bulkItem = itemFirstResult.getValue({name: 'custitem_bulk_item'});
            var htsCode = itemFirstResult.getValue({name: 'custitem_htscode'});
            var unitCBM = parseFloat(itemFirstResult.getValue({name: 'custitem3'}));
            var purchasePrice = parseFloat(itemFirstResult.getValue({name: 'cost'}));
            var primaryTariff = itemFirstResult.getValue({name: 'custitem_br_tariff_primary'});
            var itemWeight = parseFloat(itemFirstResult.getValue ({name: 'weight'}));
            var itemLength = parseFloat(itemFirstResult.getValue ({name: 'custitemsku_dim_len'}));
            var itemWidth = parseFloat(itemFirstResult.getValue ({name: 'custitemsku_dim_wid'}));
            var itemHeight = parseFloat(itemFirstResult.getValue ({name: 'custitemsku_dim_ht'}));
            var itemDimWeight = parseFloat(itemFirstResult.getValue({name: 'custitem_br_sell_unit_dimensional_wt'}));
            var amazonSizeTier = itemFirstResult.getValue({name: 'custitem_br_amazon_size_tier'});
            var maxQtyPerLabel = parseInt(itemFirstResult.getValue({name: 'custitemmax_qty_label'}));
            var itemDescription = itemFirstResult.getValue({name: 'displayname'});
            var preferredVendor = itemFirstResult.getValue({name: 'vendor'});
            var itemCategory = itemFirstResult.getText({name: 'cseg4'});
            var itemCategoryId = itemFirstResult.getValue({name: 'cseg4'});
            var itemFamily = itemFirstResult.getText({name: 'cseg5'});
            var itemFamilyId = itemFirstResult.getValue({name: 'cseg5'});
            var productStatus = itemFirstResult.getValue({name: 'custitem_product_status'});
            var amazonASIN = itemFirstResult.getValue({name: 'custitem_fa_amz_asin'});
            var itemUPC = itemFirstResult.getValue({name: 'upccode'});
            var containerCapacity40HQ = itemFirstResult.getValue({name: 'custitem_container_capacity_40hq'});
            var useContainerCapacityQty = itemFirstResult.getValue({name: 'custitem_br_use_container_qty_for_cost'});

        var itemDetails = {};
            itemDetails.basePrice = basePrice;
            itemDetails.countryOfOrigin = countryOfOrigin;
            itemDetails.fbaItem = fbaItem;
            itemDetails.bulkItem = bulkItem;
            itemDetails.htsCode = htsCode;
            itemDetails.unitCBM = unitCBM;
            itemDetails.purchasePrice = purchasePrice;
            itemDetails.primaryTariff = primaryTariff;
            itemDetails.itemWeight = itemWeight;
            itemDetails.itemLength = itemLength;
            itemDetails.itemWidth = itemWidth;
            itemDetails.itemHeight = itemHeight;
            itemDetails.itemDimWeight = itemDimWeight;
            itemDetails.amazonSizeTier = amazonSizeTier;
            itemDetails.maxQtyPerLabel = maxQtyPerLabel;
            itemDetails.itemDescription = itemDescription;
            itemDetails.preferredVendor = preferredVendor;
            itemDetails.itemCategory = itemCategory;
            itemDetails.itemCategoryId = itemCategoryId;
            itemDetails.itemFamily = itemFamily;
            itemDetails.itemFamilyId = itemFamilyId;
            itemDetails.productStatus = productStatus;
            itemDetails.amazonASIN = amazonASIN;
            itemDetails.itemUPC = itemUPC;
            itemDetails.containerCapacity40HQ = containerCapacity40HQ;
            itemDetails.useContainerCapacityQty = useContainerCapacityQty;

            itemMap[itemId] = itemDetails;

            return itemMap;
        }

//*******************************************************
// DEFAULT COSTING RECORD INFORMATION
//*******************************************************
    /**
     * The following function looks up the default information from the costing default record and populates the reference fields on the Item Costing Record.  There is only ONE default record used (1:1)
     * Filter: Item Internal ID
     * Retrieve: Item costs, dimensions, and various classification fields
     */
    function costingDefaultsSearch(){

    var defaultsMap = {};

            var defaultFields = searchModule.create({
                type: 'customrecord_br_item_costing_defaults',
                filters:
                    [
                        ['isinactive','is','F'],
                    ],
                columns:
                    [
                        searchModule.createColumn({name: 'custrecord_br_costdef_container_size_ocn'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_container_cbm_ocn'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_cont_efficient_ocn'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_loadable_cbm_ocn'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_container_size_trn'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_container_cbm_trn'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_cont_efficient_trn'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_loadable_cbm_trn'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fba_months_stored'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fbastorage_std_non'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fbastorage_std_pk'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fba_weighted_std'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fbastorage_ovr_non'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fbastorage_ovr_pk'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fba_weighted_ovr'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_amz_fuel_surch'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fba_dimwt_mod'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fba_min_dim_wt'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fba_max_dim_wt'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fba_peak_surch'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fbm_picking_amt'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_2_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_3_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_4_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_5_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_6_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_7_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_8_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_44_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_45_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_zone_46_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ups_ground_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ups_2daya_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ups_3day_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ups_1daya_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ups_1dayas_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ontrac_ground_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fedex_home_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fedex_ground_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fedex_2day_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fedex_2daya_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fedex_1dayp_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fedex_1days_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_usps_priority_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_residential_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fuel_surcharge'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_peak_surcharge_std'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_peak_surcharge_hol'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_extnd_deliv_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ext_del_surch_res'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ext_del_surch_com'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_remote_deliv_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_delv_area_surc_rem'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_other_surcharges'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_lg_leng_grth_res'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_lg_length_res'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_lg_leng_grth_com'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_lg_length_com'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ah_weight'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ah_leng_grth'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ah_length'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ah_width'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ah_packaging'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_max_weight'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_max_leng_grth'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_max_length'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_over_max_limit_fee'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_lg_pkg_min_weight'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ups_dimwt_mod'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_ups_discount_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_refund_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_return_shipmnt_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_restock_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_refund_pct_bulk'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_bulk_cost_mkup_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_amz_refund_fee_pct'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_amz_refund_fee_max'}),
                        searchModule.createColumn({name: 'custrecord_br_costdef_fixed_overhead_pct'}),

                    ]
            });
            var defaultSearch = defaultFields.run();

            var defaultFirstResult = defaultSearch.getRange({
                start: 0,
                end: 1
            }) [0];
            var containerSizeOcean = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_container_size_ocn'}));
            var containerCbmOcean = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_container_cbm_ocn'}));
            var containerEfficiencyOcean = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_cont_efficient_ocn'}));
            var containerLoadableCbmOcean = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_loadable_cbm_ocn'}));
            var containerSizeTransfer = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_container_size_trn'}));
            var containerCbmTransfer = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_container_cbm_trn'}));
            var containerEfficiencyTransfer = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_cont_efficient_trn'}));
            var containerLoadableCbmTransfer = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_loadable_cbm_trn'}));
            var fbaAvgMonthsStored = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fba_months_stored'}));
            var fbaStorageFeeStd = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fbastorage_std_non'}));
            var fbaStorageFeeStdPeak = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fbastorage_std_pk'}));
            var fbaStorageFeeStdWeighted = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fba_weighted_std'}));
            var fbaStorageFeeOversize = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fbastorage_ovr_non'}));
            var fbaStorageFeeOversizePeak = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fbastorage_ovr_pk'}));
            var fbaStorageFeeOversizeWeighted = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fba_weighted_ovr'}));
            var amazonFuelSurcharge = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_amz_fuel_surch'}));
            var fbaDimWeightModifier = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fba_dimwt_mod'}));
            var fbaDimWeightMin = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fba_min_dim_wt'}));
            var fbaDimWeightMax = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fba_max_dim_wt'}));
            var fbaPeakSurchActive = defaultFirstResult.getValue({name: 'custrecord_br_costdef_fba_peak_surch'});
            var fbmPickingAmt = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fbm_picking_amt'}));
            var upsZone2Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_2_pct'}));
            var upsZone3Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_3_pct'}));
            var upsZone4Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_4_pct'}));
            var upsZone5Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_5_pct'}));
            var upsZone6Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_6_pct'}));
            var upsZone7Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_7_pct'}));
            var upsZone8Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_8_pct'}));
            var upsZone44Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_44_pct'}));
            var upsZone45Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_45_pct'}));
            var upsZone46Pct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_zone_46_pct'}));
            var upsGroundPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ups_ground_pct'}));
            var ups2ndDayAirPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ups_2daya_pct'}));
            var ups3DaySelectPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ups_3day_pct'}));
            var upsNextDayAirPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ups_1daya_pct'}));
            var upsNextDayAirSaverPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ups_1dayas_pct'}));
            var ontracGroundPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ontrac_ground_pct'}));
            var fedexHomeDeliveryPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fedex_home_pct'}));
            var fedexGroundPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fedex_ground_pct'}));
            var fedex2DayPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fedex_2day_pct'}));
            var fedex2ndDayAirPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fedex_2daya_pct'}));
            var fedexPriorityOvernightPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fedex_1dayp_pct'}));
            var fedexStdOvernightPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fedex_1days_pct'}));
            var uspsPriorityMailPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_usps_priority_pct'}));
            var residentialDeliveryPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_residential_pct'}));
            var upsfuelSurchargeDefaultPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fuel_surcharge'}));
            var upsPeakSurchargeStd = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_peak_surcharge_std'}));
            var upsPeakSurchargeHoliday = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_peak_surcharge_hol'}));
            var upsExtendedDeliveryPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_extnd_deliv_pct'}));
            var upsExtendedDeliverySurchargeRes = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ext_del_surch_res'}));
            var upsExtendedDeliverySurchargeCom = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ext_del_surch_com'}));
            var upsRemoteDeliveryPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_remote_deliv_pct'}));
            var upsRemoteDeliverySurcharge = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_delv_area_surc_rem'}));
            var upsOtherSurcharge = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_other_surcharges'}));
            var upsLargeLenGirRes = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_lg_leng_grth_res'}));
            var upsLargeLengthRes = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_lg_length_res'}));
            var upsLargeLenGirCom = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_lg_leng_grth_com'}));
            var upsLargeLengthCom = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_lg_length_com'}));
            var upsAddlHandlingWeight = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ah_weight'}));
            var upsAddlHandlingLenGir = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ah_leng_grth'}));
            var upsAddlHandlingLength = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ah_length'}));
            var upsAddlHandlingWidth = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ah_width'}));
            var upsAddlHandlingPackaging = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ah_packaging'}));
            var upsOverMaxWeight = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_max_weight'}));
            var upsOverMaxLenGir = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_max_leng_grth'}));
            var upsOverMaxLength = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_max_length'}));
            var upsOverMaxLimitFee = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_over_max_limit_fee'}));
            var upsLargePackageMinWeight = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_lg_pkg_min_weight'}));
            var upsDimWeightModifier = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ups_dimwt_mod'}));
            var upsRateDiscountPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_ups_discount_pct'}));
            var refundPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_refund_pct'}));
            var returnShippingPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_return_shipmnt_pct'}));
            var restockPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_restock_pct'}));
            var bulkRefundPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_refund_pct_bulk'}));
            var bulkRefundCostMarkupPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_bulk_cost_mkup_pct'}));
            var amazonRefundAdminPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_amz_refund_fee_pct'}));
            var amazonRefundFeeMax = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_amz_refund_fee_max'}));
            var fixedOverheadPct = parseFloat(defaultFirstResult.getValue({name: 'custrecord_br_costdef_fixed_overhead_pct'}));


        var defaultsDetails = {};
            defaultsDetails.containerSizeOcean = containerSizeOcean;
            defaultsDetails.containerCbmOcean = containerCbmOcean;
            defaultsDetails.containerEfficiencyOcean = containerEfficiencyOcean;
            defaultsDetails.containerLoadableCbmOcean = containerLoadableCbmOcean;
            defaultsDetails.containerSizeTransfer = containerSizeTransfer;
            defaultsDetails.containerCbmTransfer = containerCbmTransfer;
            defaultsDetails.containerEfficiencyTransfer = containerEfficiencyTransfer;
            defaultsDetails.containerLoadableCbmTransfer = containerLoadableCbmTransfer;
            defaultsDetails.fbaAvgMonthsStored = fbaAvgMonthsStored;
            defaultsDetails.fbaStorageFeeStd = fbaStorageFeeStd;
            defaultsDetails.fbaStorageFeeStdPeak = fbaStorageFeeStdPeak;
            defaultsDetails.fbaStorageFeeStdWeighted = fbaStorageFeeStdWeighted;
            defaultsDetails.fbaStorageFeeOversize = fbaStorageFeeOversize;
            defaultsDetails.fbaStorageFeeOversizePeak = fbaStorageFeeOversizePeak;
            defaultsDetails.fbaStorageFeeOversizeWeighted = fbaStorageFeeOversizeWeighted;
            defaultsDetails.amazonFuelSurcharge = amazonFuelSurcharge;
            defaultsDetails.fbaDimWeightModifier = fbaDimWeightModifier;
            defaultsDetails.fbaDimWeightMin = fbaDimWeightMin;
            defaultsDetails.fbaDimWeightMax = fbaDimWeightMax;
            defaultsDetails.fbaPeakSurchActive = fbaPeakSurchActive;
            defaultsDetails.fbmPickingAmt = fbmPickingAmt;
            defaultsDetails.upsZone2Pct = upsZone2Pct;
            defaultsDetails.upsZone3Pct = upsZone3Pct;
            defaultsDetails.upsZone4Pct = upsZone4Pct;
            defaultsDetails.upsZone5Pct = upsZone5Pct;
            defaultsDetails.upsZone6Pct = upsZone6Pct;
            defaultsDetails.upsZone7Pct = upsZone7Pct;
            defaultsDetails.upsZone8Pct = upsZone8Pct;
            defaultsDetails.upsZone44Pct = upsZone44Pct;
            defaultsDetails.upsZone45Pct = upsZone45Pct;
            defaultsDetails.upsZone46Pct = upsZone46Pct;
            defaultsDetails.upsGroundPct = upsGroundPct;
            defaultsDetails.ups2ndDayAirPct = ups2ndDayAirPct;
            defaultsDetails.ups3DaySelectPct = ups3DaySelectPct;
            defaultsDetails.upsNextDayAirPct = upsNextDayAirPct;
            defaultsDetails.upsNextDayAirSaverPct = upsNextDayAirSaverPct;
            defaultsDetails.ontracGroundPct = ontracGroundPct;
            defaultsDetails.fedexHomeDeliveryPct = fedexHomeDeliveryPct;
            defaultsDetails.fedexGroundPct = fedexGroundPct;
            defaultsDetails.fedex2DayPct = fedex2DayPct;
            defaultsDetails.fedex2ndDayAirPct = fedex2ndDayAirPct;
            defaultsDetails.fedexPriorityOvernightPct = fedexPriorityOvernightPct;
            defaultsDetails.fedexStdOvernightPct = fedexStdOvernightPct;
            defaultsDetails.uspsPriorityMailPct = uspsPriorityMailPct;
            defaultsDetails.residentialDeliveryPct = residentialDeliveryPct;
            defaultsDetails.upsfuelSurchargeDefaultPct = upsfuelSurchargeDefaultPct;
            defaultsDetails.upsPeakSurchargeStd = upsPeakSurchargeStd;
            defaultsDetails.upsPeakSurchargeHoliday = upsPeakSurchargeHoliday;
            defaultsDetails.upsExtendedDeliveryPct = upsExtendedDeliveryPct;
            defaultsDetails.upsExtendedDeliverySurchargeRes = upsExtendedDeliverySurchargeRes;
            defaultsDetails.upsExtendedDeliverySurchargeCom = upsExtendedDeliverySurchargeCom;
            defaultsDetails.upsRemoteDeliveryPct = upsRemoteDeliveryPct;
            defaultsDetails.upsRemoteDeliverySurcharge = upsRemoteDeliverySurcharge;
            defaultsDetails.upsOtherSurcharge = upsOtherSurcharge;
            defaultsDetails.upsLargeLenGirRes = upsLargeLenGirRes;
            defaultsDetails.upsLargeLengthRes = upsLargeLengthRes;
            defaultsDetails.upsLargeLenGirCom = upsLargeLenGirCom;
            defaultsDetails.upsLargeLengthCom = upsLargeLengthCom;
            defaultsDetails.upsAddlHandlingWeight = upsAddlHandlingWeight;
            defaultsDetails.upsAddlHandlingLenGir = upsAddlHandlingLenGir;
            defaultsDetails.upsAddlHandlingLength = upsAddlHandlingLength;
            defaultsDetails.upsAddlHandlingWidth = upsAddlHandlingWidth;
            defaultsDetails.upsAddlHandlingPackaging = upsAddlHandlingPackaging;
            defaultsDetails.upsOverMaxWeight = upsOverMaxWeight;
            defaultsDetails.upsOverMaxLenGir = upsOverMaxLenGir;
            defaultsDetails.upsOverMaxLength = upsOverMaxLength;
            defaultsDetails.upsOverMaxLimitFee = upsOverMaxLimitFee;
            defaultsDetails.upsLargePackageMinWeight = upsLargePackageMinWeight;
            defaultsDetails.upsDimWeightModifier = upsDimWeightModifier;
            defaultsDetails.upsRateDiscountPct = upsRateDiscountPct;
            defaultsDetails.refundPct = refundPct;
            defaultsDetails.returnShippingPct = returnShippingPct;
            defaultsDetails.restockPct = restockPct;
            defaultsDetails.bulkRefundPct = bulkRefundPct;
            defaultsDetails.bulkRefundCostMarkupPct = bulkRefundCostMarkupPct;
            defaultsDetails.amazonRefundAdminPct = amazonRefundAdminPct;
            defaultsDetails.amazonRefundFeeMax = amazonRefundFeeMax;
            defaultsDetails.fixedOverheadPct = fixedOverheadPct;

        defaultsMap = defaultsDetails;

            return defaultsMap;
        }

//*******************************************************
// LANDED COSTS
//*******************************************************
    //Tariffs
    /**
     * The following function looks up the Tariff Record based on the original item record (imported to Cost Record) and updates the current tariff rate percentage and tariff per unit.
     * Filters: HTS Code, Country of Origin (was: Primary Tariff, but this is more accurate)
     * Retrieve: Percentage Rates (including Chapter 99), Per Unit Fees
     */
    function tariffInformationSearch(htsCode, countryOfOrigin) {
        var tariffMap = {};

        var tariffSearch = searchModule.create({
        type: 'customrecord_br_tariffs',
        filters: [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['custrecord_br_tariff_hts_code', 'is', htsCode],
                    'AND',
                    ['custrecord_br_tariff_country', 'anyof', countryOfOrigin],
                ],
        columns: [
            searchModule.createColumn({name: 'custrecord_br_total_duty_percent', summary: searchModule.Summary.SUM}),
            searchModule.createColumn({name: 'custrecord_br_duty_per_unit', summary: searchModule.Summary.SUM})
        ]
    });

        tariffSearch.run().each(function(result) {

            var tariffDutyPct = parseFloat(result.getValue({name: 'custrecord_br_total_duty_percent', summary: searchModule.Summary.SUM}));
            var tariffDutyPerUnit = parseFloat(result.getValue({name: 'custrecord_br_duty_per_unit', summary: searchModule.Summary.SUM}));

            var tariffDetails = {};
            tariffDetails.tariffDutyPct = tariffDutyPct;
            tariffDetails.tariffDutyPerUnit = tariffDutyPerUnit;

            tariffMap[htsCode, countryOfOrigin] = tariffDetails;

            return true;
           });

           return tariffMap;
    }

//*******************************************************
    /**
     * The following function  (Ocean Lanes) looks up the related ocean lanes used from the item's Country of Origin and returns the sum of the weighted costs per lane for that country.
     * Filter: Country of Origin
     * Retrieve: Sum of weighted costs (percentage we use a lane * that lane's cost) for lanes originating at Country of Origin.
     */
    function oceanLaneInfoSearch(countryOfOrigin) {
        var oceanLaneMap = {};

        var oceanLaneSearch = searchModule.create({
            type: 'customrecord_br_ocean_freight_lanes',
            filters: ['custrecord_br_lane_origin', 'anyof', countryOfOrigin],
            columns: [
                searchModule.createColumn({name: 'custrecord_br_lanes_weighted_cost', summary: searchModule.Summary.SUM})
            ]
        });
        oceanLaneSearch.run().each(function(result) {
            var oceanLaneWeightedCost = parseFloat(result.getValue({name: 'custrecord_br_lanes_weighted_cost', summary: searchModule.Summary.SUM}));

            var oceanLaneDetails = {};
            oceanLaneDetails.oceanLaneWeightedCost = oceanLaneWeightedCost;
            oceanLaneMap[countryOfOrigin] = oceanLaneDetails;

            return true;
    });
        return oceanLaneMap;
}

//*******************************************************
    /**
     * The following function  (Sourcing Fees)
     * Filter:
     * Retrieve:
     * Write:
     */
    function sourcingInfoSearch(countryOfOrigin){
        var sourcingMap ={};

        var sourcingSearch = searchModule.create({
            type: 'customrecord_br_sourcing_fees',
            filters: ['custrecord_br_sourcing_country', 'anyof', countryOfOrigin],
            columns: [
                searchModule.createColumn({name: 'custrecord_br_sourcing_commission_pct', summary: searchModule.Summary.SUM})
            ]
        });
        sourcingSearch.run().each(function(result) {
            var sourcingCommissionPct = parseFloat(result.getValue({name: 'custrecord_br_sourcing_commission_pct', summary: searchModule.Summary.SUM}));

            var sourcingDetails = {};
            sourcingDetails.sourcingCommissionPct = sourcingCommissionPct;
            sourcingMap[countryOfOrigin] = sourcingDetails;

            return true;
        });

        return sourcingMap;
}

//*******************************************************
// TRANSFER COSTS
//*******************************************************
    /**
     * The following function  (Weighted Transfer Lanes)
     * Filter: FBA/FBM - but passed as string.
     * Retrieve: Sum of weighted transfer lane costs.
     */
    function transferLaneInfoSearch(transferCategory) {
        var transferLaneMap = {};

        var filteredDestination = [];  //note: no designation for Bulk Items - they don't transfer, so value is 0.
            if(transferCategory == 'fba') {
                filteredDestination.push(['isinactive','is','F'])
                filteredDestination.push('AND')
                filteredDestination.push(['custrecord_br_transfer_lane_destination', 'anyof', '9']) // 9 is US FBA Warehouse
            } else {
                filteredDestination.push(['isinactive','is','F'])
                filteredDestination.push('AND')
                filteredDestination.push(['custrecord_br_transfer_lane_destination', 'noneof', '9'])
            }

        var transferLaneSearch = searchModule.create({
            type: 'customrecord_br_transfer_lanes',
            filters: [filteredDestination],
            columns: [searchModule.createColumn({name: 'custrecord_br_transfer_lane_weighted_cst', summary: searchModule.Summary.SUM})
            ]
        });
        transferLaneSearch.run().each(function(result) {
            var transferLaneWeightedCost = parseFloat(result.getValue({name: 'custrecord_br_transfer_lane_weighted_cst', summary: searchModule.Summary.SUM}));

            var transferLaneDetails = {};
           transferLaneDetails.transferLaneWeightedCost = transferLaneWeightedCost;
            transferLaneMap[transferCategory] = transferLaneDetails;

            return true;
        });
        return transferLaneMap;
    }



//*******************************************************
// STORAGE COSTS
//*******************************************************

    //FBA Storage
    /**
     * Note that FBA Storage is calculated at completely from the Costing Default Record and does not need a library function.
     * This is as of July 2022 and could change in the future.
     */
    //FBM Storage
    /**
     * Note that FBM Storage is calculated at 0, as we do not have limited space in the warehouses.
     * This is as of July 2022 and could change in the future.
     */


//*******************************************************
// FULFILLMENT COSTS
//*******************************************************
    //FBA Fulfillment
    /**
     * The following function  (FBA Fulfillment)
     * Filter: fbaWeight (greater of actual or Amazon Dim Weight), Item Length/Width/Height/Length + Girth
     * Retrieve: Fee record, Base Fee, Additional Fee per Pound, Additional Fee per Pound Min Weight (trigger)
     * Notes: This is a complicated function because Amazon has multiple variables which are the same within different overall Size Tiers
     * The result is to retrieve only 1 record, but it has to be the smallest value, but searched against growing parameters.
     * To avoid returning all possible records, which would be the correct one in addition to all 'larger' tier records, the search is sorted
     * and only the first result is returned.  This provides the 'smallest' tier size that is appropriate to each item.
     */
    function fbaFulfillInfoSearch(fbaWeight, itemLength, itemWidth, itemHeight, itemLengthGirth){
        var fbaFulfillMap = {};

        var fbaWeightCeiling = Math.ceil(fbaWeight);

        var fbaFulfillSearch = searchModule.create({
            type: 'customrecord_br_fba_fulfillment_rates',
            filters:
                [
                    ['custrecord_br_fbafulfill_wt_min', 'lessthan', fbaWeight],
                    "AND",
                    ['custrecord_br_fbafulfill_wt_max','greaterthanorequalto', fbaWeight],
                    "AND",
                    ['custrecord_br_fbafulfill_length','greaterthanorequalto', itemLength],
                    "AND",
                    ['custrecord_br_fbafulfill_width','greaterthanorequalto', itemWidth],
                    "AND",
                    ['custrecord_br_fbafulfill_height','greaterthanorequalto', itemHeight],
                    "AND",
                    ['custrecord_br_fbafulfill_len_girth','greaterthan', itemLengthGirth],
                    "AND",
                    ['custrecord_br_fbafulfill_per_lb_trigger', 'lessthanorequalto', fbaWeightCeiling]
                ],
            columns:
                [
                    'internalid',
                    'custrecord_br_fbafulfill_wt_min',
                    searchModule.createColumn({
                        name: "custrecord_br_fbafulfill_wt_max",
                        sort: searchModule.Sort.ASC
                    }),
                    'custrecord_br_fbafulfill_len_girth',
                    'custrecord_br_fbafulfill_base_fee',
                    'custrecord_br_fbafulfill_peak_fee',
                    'custrecord_br_fbafulfill_fee_per_lb',
                    'custrecord_br_fbafulfill_per_lb_trigger'
                ]            
        })
        var fbaFulfillSearchResults = fbaFulfillSearch.run();
        var fbaFulfillFirstResult = fbaFulfillSearchResults.getRange({
            start: 0,
            end: 1
        }) [0];

        var fbaFulfillFeeId = fbaFulfillFirstResult.getValue({name: 'internalid'});
        var fbaFulfillBaseFee = parseFloat(fbaFulfillFirstResult.getValue({name: 'custrecord_br_fbafulfill_base_fee'}));
        var fbaFulfillPeakFee = parseFloat(fbaFulfillFirstResult.getValue({name: 'custrecord_br_fbafulfill_peak_fee'}));
        var fbaFulfillFeePerPound = parseFloat(fbaFulfillFirstResult.getValue({name: 'custrecord_br_fbafulfill_fee_per_lb'}));
        var fbaFulfillPerPoundTrigger = parseFloat(fbaFulfillFirstResult.getValue({name: 'custrecord_br_fbafulfill_per_lb_trigger'}));

        var fbaFulfillDetails = {};
            fbaFulfillDetails.fbaFulfillFeeId = fbaFulfillFeeId;
            fbaFulfillDetails.fbaFulfillBaseFee = fbaFulfillBaseFee;
            fbaFulfillDetails.fbaFulfillPeakFee = fbaFulfillPeakFee;
            fbaFulfillDetails.fbaFulfillFeePerPound = fbaFulfillFeePerPound;
            fbaFulfillDetails.fbaFulfillPerPoundTrigger = fbaFulfillPerPoundTrigger;

        fbaFulfillMap[fbaWeight, itemLength, itemWidth, itemHeight, itemLengthGirth] = fbaFulfillDetails;

        return fbaFulfillMap;
    }

//*******************************************************
    //FBM Picking  -TBD-
    /**
     * The following function  (FBM Picking)
     * Filter:
     * Retrieve:
     * Write:
     */

//*******************************************************
    //FBM Rate Tables
    /**
     * The following function searches the Rate tables for required information
     * to update the delivered costs record, which is pulled into the Item Costing Master.
     * Filter:
     * Retrieve:
     * Write:
     */

    function fbmRateTableInfoSearch(fbmWeight){
        var fbmRateTableMap = {};

        var fbmRateSearch = searchModule.create({
            type: 'customrecord_br_shipping_rate_table',
            //Set Filters
            filters:
                [
                    ['isinactive','is','F'],
                    'AND',
                    ['custrecord_br_ratetable_weight','equalto',fbmWeight]
                ],
            columns: [
                searchModule.createColumn({name: 'custrecord_br_ratetable_base_fee_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_resident_fee_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_overmaxlmt_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_peaksurc_lg_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_peaksurc_addl_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_ah_weight_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_ah_len_girth_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_ah_length_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_ah_width_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_ah_pkgng_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_res_len_girth_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_res_length_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_com_len_girth_wt', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_ratetable_com_length_wt', summary: searchModule.Summary.SUM}),
            ]
        });

        fbmRateSearch.run().each(function(result) {
            var fbmRateTableBaseFee = parseFloat(result.getValue({name: 'custrecord_br_ratetable_base_fee_wt', summary: search.Summary.SUM}));
            var fbmRateTableResidentialDeliveryFee = parseFloat(result.getValue({name: 'custrecord_br_ratetable_resident_fee_wt', summary: search.Summary.SUM}));
            var fbmRateTableOverMaxLimitWt = parseFloat(result.getValue({name: 'custrecord_br_ratetable_overmaxlmt_wt', summary: search.Summary.SUM}));
            var fbmRateTablePeakSurchLgWt = parseFloat(result.getValue({name: 'custrecord_br_ratetable_peaksurc_lg_wt', summary: search.Summary.SUM}));
            var fbmRateTablePeakSurchAddlWt = parseFloat(result.getValue({name: 'custrecord_br_ratetable_peaksurc_addl_wt', summary: search.Summary.SUM}));
            var fbmRateTableAddlHandlingWt = parseFloat(result.getValue({name: 'custrecord_br_ratetable_ah_weight_wt', summary: search.Summary.SUM}));
            var fbmRateTableAddlHandlingLenGir = parseFloat(result.getValue({name: 'custrecord_br_ratetable_ah_len_girth_wt', summary: search.Summary.SUM}));
            var fbmRateTableAddlHandlingLength = parseFloat(result.getValue({name: 'custrecord_br_ratetable_ah_length_wt', summary: search.Summary.SUM}));
            var fbmRateTableAddlHandlingWidth = parseFloat(result.getValue({name: 'custrecord_br_ratetable_ah_width_wt', summary: search.Summary.SUM}));
            var fbmRateTableAddlHandlingPackaging = parseFloat(result.getValue({name: 'custrecord_br_ratetable_ah_pkgng_wt', summary: search.Summary.SUM}));
            var fbmRateTableResidentialLenGir = parseFloat(result.getValue({name: 'custrecord_br_ratetable_res_len_girth_wt', summary: search.Summary.SUM}));
            var fbmRateTableResidentialLength = parseFloat(result.getValue({name: 'custrecord_br_ratetable_res_length_wt', summary: search.Summary.SUM}));
            var fbmRateTableCommercialLenGir = parseFloat(result.getValue({name: 'custrecord_br_ratetable_com_len_girth_wt', summary: search.Summary.SUM}));
            var fbmRateTableCommercialLength = parseFloat(result.getValue({name: 'custrecord_br_ratetable_com_length_wt', summary: search.Summary.SUM}));

            var fbmRateDetails = {};
                fbmRateDetails.fbmRateTableBaseFee = fbmRateTableBaseFee;
                fbmRateDetails.fbmRateTableResidentialDeliveryFee = fbmRateTableResidentialDeliveryFee;
                fbmRateDetails.fbmRateTableOverMaxLimitWt = fbmRateTableOverMaxLimitWt;
                fbmRateDetails.fbmRateTablePeakSurchLgWt = fbmRateTablePeakSurchLgWt;
                fbmRateDetails.fbmRateTablePeakSurchAddlWt = fbmRateTablePeakSurchAddlWt;
                fbmRateDetails.fbmRateTableAddlHandlingWt = fbmRateTableAddlHandlingWt;
                fbmRateDetails.fbmRateTableAddlHandlingLenGir = fbmRateTableAddlHandlingLenGir;
                fbmRateDetails.fbmRateTableAddlHandlingLength = fbmRateTableAddlHandlingLength;
                fbmRateDetails.fbmRateTableAddlHandlingWidth = fbmRateTableAddlHandlingWidth;
                fbmRateDetails.fbmRateTableAddlHandlingPackaging = fbmRateTableAddlHandlingPackaging;
                fbmRateDetails.fbmRateTableResidentialLenGir = fbmRateTableResidentialLenGir;
                fbmRateDetails.fbmRateTableResidentialLength = fbmRateTableResidentialLength;
                fbmRateDetails.fbmRateTableCommercialLenGir = fbmRateTableCommercialLenGir;
                fbmRateDetails.fbmRateTableCommercialLength = fbmRateTableCommercialLength;

            fbmRateTableMap[fbmWeight] = fbmRateDetails;

            return true;
        });

        return fbmRateTableMap;
    }

//*******************************************************
//FBM Shipping (Delivered Cost Record)
/**
 * The following function searches the Delivered Cost Records for required information.
 * This record has aggregated the rate tables to unique weights by lb.
 * Filter: fbmWeight (greater of actual or dimensional weight (UPS)
 * Retrieve: All fees associated with the FBM Weight.
 */
    function fbmShippingInfoSearch(fbmWeight){
        var fbmShippingCostMap = {};

        var fbmShippingCostSearch = searchModule.create({
            type: 'customrecord_br_delivered_costs',
            filters: [
                ['isinactive', 'is', 'F'],
                'AND',
                ['custrecord_br_delvd_shipping_weight', 'equalto', fbmWeight],
            ],
            columns: [
               //searchModule.createColumn({name: 'internalid'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_base_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_residential_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_peak_lgpkg_std_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_peak_addlhnd_std_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_ah_weight_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_ah_len_girth_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_ah_length_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_ah_width_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_ah_pkgng_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_res_len_girth_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_res_length_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_com_len_girth_fbm'}),
                searchModule.createColumn({name: 'custrecord_br_delvd_com_length_fbm'})
            ]
        });

            fbmShippingCostSearch.run().each(function(result){
                //var internalId = result.getValue({name: 'internalid'});
                var shippingBaseFee = parseFloat(result.getValue({name: 'custrecord_br_delvd_base_fbm'}));
                var shippingResidentialFee = parseFloat(result.getValue({name: 'custrecord_br_delvd_residential_fbm'}));
                var shippingPeakSurchargeLarge = parseFloat(result.getValue({name: 'custrecord_br_delvd_peak_lgpkg_std_fbm'}));
                var shippingPeakSurchargeAH = parseFloat(result.getValue({name: 'custrecord_br_delvd_peak_addlhnd_std_fbm'}));
                var shippingAHWeight = parseFloat(result.getValue({name: 'custrecord_br_delvd_ah_weight_fbm'}));
                var shippingAHLenGirth = parseFloat(result.getValue({name: 'custrecord_br_delvd_ah_len_girth_fbm'}));
                var shippingAHLength = parseFloat(result.getValue({name: 'custrecord_br_delvd_ah_length_fbm'}));
                var shippingAHWidth = parseFloat(result.getValue({name: 'custrecord_br_delvd_ah_width_fbm'}));
                var shippingAHPackaging = parseFloat(result.getValue({name: 'custrecord_br_delvd_ah_pkgng_fbm'}));
                var shippingLgPkgLenGirthRes = parseFloat(result.getValue({name: 'custrecord_br_delvd_res_len_girth_fbm'}));
                var shippingLgPkgLengthRes = parseFloat(result.getValue({name: 'custrecord_br_delvd_res_length_fbm'}));
                var shippingLgPkgLenGirthCom = parseFloat(result.getValue({name: 'custrecord_br_delvd_com_len_girth_fbm'}));
                var shippingLgPkgLengthCom = parseFloat(result.getValue({name: 'custrecord_br_delvd_com_length_fbm'}));

                var shippingCostDetails = {};
                    //shippingCostDetails.internalId  = internalId;
                    shippingCostDetails.shippingBaseFee  = shippingBaseFee;
                    shippingCostDetails.shippingResidentialFee  = shippingResidentialFee;
                    shippingCostDetails.shippingPeakSurchargeLarge  = shippingPeakSurchargeLarge;
                    shippingCostDetails.shippingPeakSurchargeAH  = shippingPeakSurchargeAH;
                    shippingCostDetails.shippingAHWeight  = shippingAHWeight;
                    shippingCostDetails.shippingAHLenGirth  = shippingAHLenGirth;
                    shippingCostDetails.shippingAHLength  = shippingAHLength;
                    shippingCostDetails.shippingAHWidth  = shippingAHWidth;
                    shippingCostDetails.shippingAHPackaging  = shippingAHPackaging;
                    shippingCostDetails.shippingLgPkgLenGirthRes  = shippingLgPkgLenGirthRes;
                    shippingCostDetails.shippingLgPkgLengthRes  = shippingLgPkgLengthRes;
                    shippingCostDetails.shippingLgPkgLenGirthCom  = shippingLgPkgLenGirthCom;
                    shippingCostDetails.shippingLgPkgLengthCom  = shippingLgPkgLengthCom;

                fbmShippingCostMap[fbmWeight] = shippingCostDetails;

                return true;
            });

    return fbmShippingCostMap;
}

//*******************************************************
//FBM Additional Handling Actual Weight (Delivered Cost Record)
        /**
         * The following function searches the Delivered Cost Records for required information.
         * This record has aggregated the rate tables to unique weights by lb.
         * Actual weight is used for Additional Handling Weight fees only.
         * Item weight (Ceiling) must be > 50 lbs.
         * Filter: itemWeightCeil (Ceiling value of itemWeight)
         * Retrieve: Additional Handling: Weight
         */
        function actualAHSearch(itemWeightCeil){
            var fbmAHWeight = {};

            var fbmAHWeightSearch = searchModule.create({
                type: 'customrecord_br_delivered_costs',
                filters: [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['custrecord_br_delvd_shipping_weight', 'equalto', itemWeightCeil],
                ],
                columns: [
                    searchModule.createColumn({name: 'custrecord_br_delvd_ah_weight_fbm'}),
                ]
            });

            fbmAHWeightSearch.run().each(function(result){
                var actualAHWeightFee = parseFloat(result.getValue({name: 'custrecord_br_delvd_ah_weight_fbm'}));

                var ahWeightFeeDetails = {};
                ahWeightFeeDetails.actualAHWeightFee  = actualAHWeightFee;

                fbmAHWeight[itemWeightCeil] = ahWeightFeeDetails;

                return true;
            });

            return fbmAHWeight;
        }

//*******************************************************
// SOLD COSTS
//*******************************************************
    //Sales Commissions
    /**
     * The following function  (Sales Commissions)
     * Filter: Item Classification (FBM, FBA, Bulk)
     * Retrieve: Sums of Weighted Commission Percentage and Per Unit values
     */
    function salesCommissionInfoSearch(itemClassification) {
        var salesCommissionMap = {};

        var filteredItemClass = [];
        if(itemClassification == 'fbm') {
            filteredItemClass.push(['isinactive','is','F'])
            filteredItemClass.push('AND')
            filteredItemClass.push(['custrecord_br_commission_item_class', 'anyof', '1']) // 1 is FBM, EDI, WebStore
        } else if (itemClassification == 'fba') {
            filteredItemClass.push(['isinactive','is','F'])
            filteredItemClass.push('AND')
            filteredItemClass.push(['custrecord_br_commission_item_class', 'anyof', '2']) // 2 is FBA
        } else if (itemClassification == 'bulk') {
            filteredItemClass.push(['isinactive','is','F'])
            filteredItemClass.push('AND')
            filteredItemClass.push(['custrecord_br_commission_item_class', 'anyof', '3']) // 3 is Bulk Items
        }

        var salesCommissionSearch = searchModule.create({
            type: 'customrecord_br_sales_commissions',
            filters: [filteredItemClass],
            columns: [
                searchModule.createColumn({name: 'custrecord_br_commission_weighted_pct', summary: searchModule.Summary.SUM}),
                searchModule.createColumn({name: 'custrecord_br_commission_weighted_per', summary: searchModule.Summary.SUM})
            ]
        });
        salesCommissionSearch.run().each(function(result) {
            var salesCommissionWeightedPct = parseFloat(result.getValue({name: 'custrecord_br_commission_weighted_pct', summary: searchModule.Summary.SUM}));
            var salesCommissionWeightedPerUnit = parseFloat(result.getValue({name: 'custrecord_br_commission_weighted_per', summary: searchModule.Summary.SUM}));

            var salesCommissionDetails = {};
            salesCommissionDetails.salesCommissionWeightedPct = salesCommissionWeightedPct;
            salesCommissionDetails.salesCommissionWeightedPerUnit = salesCommissionWeightedPerUnit;
            salesCommissionMap[itemClassification] = salesCommissionDetails;

            return true;
        });
        return salesCommissionMap;
    }


//*******************************************************
    //Processing Fees
    /**
     * Processing Fees are (currently as of July 2022) too minuscule to warrant calculating.
     * If this changes - we will add a library module
     */

//*******************************************************
    //Refunds & Returns
    /**
     * Note that Refund and Return Costs are calculated at completely from the Costing Default Record and does not need a library function.
     * This is as of July 2022 and could change in the future.
     */


    return {
        itemInformationSearch: itemInformationSearch,
        costingDefaultsSearch: costingDefaultsSearch,
        tariffInformationSearch: tariffInformationSearch,
        oceanLaneInfoSearch: oceanLaneInfoSearch,
        sourcingInfoSearch: sourcingInfoSearch,
        transferLaneInfoSearch: transferLaneInfoSearch,
        fbaFulfillInfoSearch: fbaFulfillInfoSearch,
        fbmRateTableInfoSearch: fbmRateTableInfoSearch,
        actualAHSearch: actualAHSearch,
        fbmShippingInfoSearch: fbmShippingInfoSearch,
        salesCommissionInfoSearch: salesCommissionInfoSearch
    };
});
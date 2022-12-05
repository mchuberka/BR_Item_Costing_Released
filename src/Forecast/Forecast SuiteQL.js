// Forecast Data Table
var sql = "SELECT BUILTIN_RESULT.TYPE_STRING(BUILTIN.DF(CUSTOMRECORD_BR_ITEM_FORECAST.custrecord_br_forecast_item_name)) AS custrecord_br_forecast_item_name, BUILTIN_RESULT.TYPE_STRING(BUILTIN.HIERARCHY(CUSTOMRECORD_BR_ITEM_FORECAST.custrecord_br_forecast_location, 'DISPLAY_JOINED_INTEGER')) AS custrecord_br_forecast_location, BUILTIN_RESULT.TYPE_STRING(CUSTOMRECORD_BR_ITEM_FORECAST.custrecord_br_forecast_year) AS custrecord_br_forecast_year, BUILTIN_RESULT.TYPE_STRING(BUILTIN.DF(CUSTOMRECORD_BR_ITEM_FORECAST.custrecord_br_forecast_month)) AS custrecord_br_forecast_month, BUILTIN_RESULT.TYPE_CURRENCY_HIGH_PRECISION(BUILTIN.CONSOLIDATE(item_SUB.price, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'), BUILTIN.CURRENCY(BUILTIN.CONSOLIDATE(item_SUB.price, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'))) AS price, BUILTIN_RESULT.TYPE_INTEGER(CUSTOMRECORD_BR_ITEM_FORECAST.custrecord_br_forecast_quantity) AS custrecord_br_forecast_quantity, BUILTIN_RESULT.TYPE_FLOAT(item_SUB.price * CUSTOMRECORD_BR_ITEM_FORECAST.custrecord_br_forecast_quantity) AS custrecord_br_forec FROM CUSTOMRECORD_BR_ITEM_FORECAST, (SELECT item.ID AS ID, item.ID AS id_join, itemPrice.price AS price, itemPrice.pricelevelname AS pricelevelname_crit FROM item, itemPrice WHERE item.ID = itemPrice.item(+) ) item_SUB WHERE CUSTOMRECORD_BR_ITEM_FORECAST.custrecord_br_forecast_item_name = item_SUB.ID(+) AND item_SUB.pricelevelname_crit IN ('Base Price') ";

/*********************************** */

// Run the query
var resultSet = query.runSuiteQL({query: sql,params:[]});
var results = resultSet.results;
for (var i = results.length - 1; i >= 0; i--)
    log.debug(results[i].values);

var resultsObj = resultSet.asMappedResults();
log.debug("Mapped Results",resultsObj);

/*********************************** */

// Run the query as a paged query
var results = query.runSuiteQLPaged({query: sql,params:[],pageSize: 50});
for (var i = 0; i < results.pageRanges.length; i++)  {
    var page = results.fetch(i);
    log.debug(page.pageRange.index,page.pageRange.size);
    var pageResults = page.data.results;
    for (var r = 0; r < pageResults.length; r++)
        log.debug(pageResults[r].values);
}

/*********************************** */

// Run the query as a paged query
// Retrieve the query results using an iterator
var results = query.runSuiteQLPaged({query: sql,params:[],pageSize: 50});
var resultIterator = results.iterator();
resultIterator.each(function(page) {
    log.debug(page.value.pageRange.index,page.value.pageRange.size);
    var pageIterator = page.value.data.iterator();
    pageIterator.each(function(row) {
        log.debug(row.value.values);
        return true;
    });
    return true;
});





// Costing Data Table
var sql = "SELECT BUILTIN_RESULT.TYPE_STRING(BUILTIN.DF(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item)) AS custrecord_br_cst1_item, BUILTIN_RESULT.TYPE_CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item_purchase_price, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'), BUILTIN.CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item_purchase_price, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'))) AS custrecord_br_cst1_item_purchase_price, BUILTIN_RESULT.TYPE_CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item_base_price, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'), BUILTIN.CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_item_base_price, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'))) AS custrecord_br_cst1_item_base_price, BUILTIN_RESULT.TYPE_STRING(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_primary_class) AS custrecord_br_cst1_primary_class, BUILTIN_RESULT.TYPE_CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_total_unit_costs, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'), BUILTIN.CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_total_unit_costs, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'))) AS custrecord_br_cst1_total_unit_costs, BUILTIN_RESULT.TYPE_CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_gross_margin, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'), BUILTIN.CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_gross_margin, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'))) AS custrecord_br_cst1_gross_margin, BUILTIN_RESULT.TYPE_STRING(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_alternate) AS custrecord_br_cst1_alternate, BUILTIN_RESULT.TYPE_CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_alt_unit_costs, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'), BUILTIN.CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_alt_unit_costs, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'))) AS custrecord_br_cst1_alt_unit_costs, BUILTIN_RESULT.TYPE_CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_alt_gross_margin, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'), BUILTIN.CURRENCY(BUILTIN.CONSOLIDATE(CUSTOMRECORD_BR_ITEM_MASTER_CST1.custrecord_br_cst1_alt_gross_margin, 'INCOME', 'NONE', 'DEFAULT', 0, 0, 'DEFAULT'))) AS custrecord_br_cst1_alt_gross_margin FROM CUSTOMRECORD_BR_ITEM_MASTER_CST1 ";

/*********************************** */

// Run the query
var resultSet = query.runSuiteQL({query: sql,params:[]});
var results = resultSet.results;
for (var i = results.length - 1; i >= 0; i--)
    log.debug(results[i].values);

var resultsObj = resultSet.asMappedResults();
log.debug("Mapped Results",resultsObj);

/*********************************** */

// Run the query as a paged query
var results = query.runSuiteQLPaged({query: sql,params:[],pageSize: 50});
for (var i = 0; i < results.pageRanges.length; i++)  {
    var page = results.fetch(i);
    log.debug(page.pageRange.index,page.pageRange.size);
    var pageResults = page.data.results;
    for (var r = 0; r < pageResults.length; r++)
        log.debug(pageResults[r].values);
}

/*********************************** */

// Run the query as a paged query
// Retrieve the query results using an iterator
var results = query.runSuiteQLPaged({query: sql,params:[],pageSize: 50});
var resultIterator = results.iterator();
resultIterator.each(function(page) {
    log.debug(page.value.pageRange.index,page.value.pageRange.size);
    var pageIterator = page.value.data.iterator();
    pageIterator.each(function(row) {
        log.debug(row.value.values);
        return true;
    });
    return true;
});


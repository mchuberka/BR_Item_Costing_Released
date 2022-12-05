// # The following method takes an InventoryItem record and sets its pricing matrix.
// # It sets the base price at quantity 0.
// # If an invalid price was entered (a non-numeric value), it does not set the pricing matrix.

private void createPricingMatrix(InventoryItem item)
{
   _console.write("\nPlease enter the base price: ");
   String priceString = _console.readLn();
   Price[] prices = new Price[1];
   prices[0] = new Price();
   try
   {
   prices[0].setValue(Double.valueOf(priceString));
   prices[0].setQuantity(null);

   PriceList priceList = new PriceList();
   priceList.setPrice(prices);

   Pricing[] pricing = new Pricing[1];
   pricing[0] = new Pricing();
   pricing[0].setPriceList(priceList);
   pricing[0].setDiscount(null);
   RecordRef priceLevel = new RecordRef();
   priceLevel.setInternalId(BASE_PRICE_LEVEL_INTERNAL_ID);
   priceLevel.setType(RecordType.priceLevel);
   pricing[0].setPriceLevel(priceLevel);
   RecordRef currUSD = new RecordRef();
   currUSD.setInternalId("1");
   pricing[0].setCurrency(currUSD);

   PricingMatrix pricingMatrix = new PricingMatrix();
   pricingMatrix.setPricing(pricing);
   pricingMatrix.setReplaceAll(false);

   item.setPricingMatrix(pricingMatrix);
   }
   catch (NumberFormatException e)
   {
      _console.error("\nInvalid base price entered: " + priceString + ".
         Proceed creating item without setting pricing matrix.");
   }
}
export function formatNepaliRupees(number) {
  const numberString = number.toString();

  // Separate integer and decimal parts
  const [integerPart, decimalPart] = numberString.split(".");

  // Add commas based on Nepalese numbering system grouping
  const formattedInteger = integerPart
    .split("")
    .reverse()
    .map((digit, index) => {
      return index % 2 === 0 && index !== 0 ? `,${digit}` : digit;
    })
    .reverse()
    .join("");

  const newFormattedNumber =
    formattedInteger.charAt(0) === ","
      ? formattedInteger.slice(1)
      : formattedInteger;

  // Combine the formatted integer and decimal parts
  const formattedNumber = decimalPart
    ? `${newFormattedNumber}.${decimalPart}`
    : newFormattedNumber;

  // Add the Nepali Rupees symbol (₨) or use the Nepali symbol if available
  const nepaliRupeesSymbol = "NPR"; // You may replace this with the actual Nepali Rupees symbol if available

  // Return the formatted string without space or comma between the currency symbol and the number
  return `${nepaliRupeesSymbol} ${formattedNumber}`;
}

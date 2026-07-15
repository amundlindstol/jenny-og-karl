export const text = {
  weddingDate: new Date("2026-08-08")
    .toLocaleDateString("nb-NO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .replace(/^./, (char: string) => char.toUpperCase()), // Remove parentheses around the date
  weddingDateShort: "8. august 2026",
  ceremonyTime: "13:00",
  receptionTime: "18:00",

  // Ceremony
  churchName: "Risør kirke",
  churchAddress: "Kirkegata 2, 4950 Risør",
  churchAddressUrl: "https://maps.app.goo.gl/risorkirkegata",

  // Reception
  venue: "Moen Trebåtbyggeri",
  address: "Moensveien 38, 4950 Risør",
  addressUrl: "https://maps.app.goo.gl/58jRof4L78cwPQi39",

  // Pre-party evening before
  prePartyName: "S.O",
  prePartyAddress: "S.O, Risør",
  prePartyAddressUrl: "https://maps.app.goo.gl/BvsQ28y66J67JySf8",
  prePartyDate: "7. august 2026",
  prePartyTime: "18:00",

  // Contact
  contactEmail: "jennyhofton95@icloud.com",
  contactPhone: "+47 90 81 08 87",
  contactEmailToastmaster: "alindstol@gmail.com",
  contactPhoneToastmaster: "+47 95 13 13 28",

  // Hotels
  hotels: [
    {
      name: "Det Lille Hotel",
      address: "Strandgata 10, 4950 Risør",
      addressUrl: "https://maps.app.goo.gl/5a8SdjGcnbduGb9b9",
      phone: "+47 37 15 14 95",
      phoneFormatted: "37 15 14 95",
    },
    {
      name: "Risør Hotell",
      address: "Tangengata 16, 4950 Risør",
      addressUrl: "https://maps.app.goo.gl/7We7BZgh1cyG4nRh7",
      phone: "+47 37 14 80 00",
      phoneFormatted: "37 14 80 00",
    },
  ],

  // Airbnb
  airbnbUrl:
    "https://www.airbnb.no/s/Ris%C3%B8r--Norge/homes?query=Ris%C3%B8r,%20Norge&place_id=ChIJV78h-YOoR0YRxKc7TfEyW34&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2026-04-01&monthly_length=3&monthly_end_date=2026-07-01&search_mode=regular_search&price_filter_input_type=2&channel=EXPLORE&date_picker_type=calendar&checkin=2026-08-07&checkout=2026-08-09&source=structured_search_input_header&search_type=unknown",
};

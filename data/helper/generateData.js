import moment from "moment";
import { faker } from "@faker-js/faker";

const now = moment().format("YYYY-MM-DD");
const nextOneWeek = moment().add(1, "week").format("YYYY-MM-DD");

export function generateValidJsonBookingPayload() {
  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int() * 2,
    depositpaid: true,
    bookingdates: {
      checkin: now,
      checkout: nextOneWeek,
    },
  };
}

export function generateValidXmlBookingPayload() {
  return `<booking>
    <firstname>${faker.person.firstName()}</firstname>
    <lastname>${faker.person.lastName()}</lastname>
    <totalprice>${faker.number.int() * 2}</totalprice>
    <depositpaid>true</depositpaid>
    <bookingdates>
      <checkin>${now}</checkin>
      <checkout>${nextOneWeek}</checkout>
    </bookingdates>
   
  </booking>`;
}

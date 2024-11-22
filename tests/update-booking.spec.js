import { test, expect } from "@playwright/test";
import {
  generateValidJsonBookingPayload,
  generateValidXmlBookingPayload,
} from "../data/helper/generateData";
import tv4 from "tv4";
import * as xml2js from "xml2js";
import { default as xmlSchemaValidator } from "xsd-validator";

const BOOKING_URL = "/booking";
const AUTH_URL = "/auth";

test("Update existing booking with Json payload", async ({ request }) => {
  //arrange
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Generated schema for Root",
    type: "object",
    properties: {
      firstname: {
        type: "string",
      },
      lastname: {
        type: "string",
      },
      totalprice: {
        type: "number",
      },
      depositpaid: {
        type: "boolean",
      },
      bookingdates: {
        type: "object",
        properties: {
          checkin: {
            type: "string",
          },
          checkout: {
            type: "string",
          },
        },
        required: ["checkin", "checkout"],
      },
      additionalneeds: {
        type: "string",
      },
    },
    required: [
      "firstname",
      "lastname",
      "totalprice",
      "depositpaid",
      "bookingdates",
    ],
  };
  const createPayloadJson = generateValidJsonBookingPayload();

  const createdBookReq = await request.post(BOOKING_URL, {
    data: { ...createPayloadJson },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  await expect(createdBookReq.status()).toBe(200);
  const createBookRespJson = await createdBookReq.json();
  const bookingId = createBookRespJson.bookingid;

  // act
  const authReq = await request.post(AUTH_URL, {
    data: {
      username: "admin",
      password: "password123",
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
  const authenBody = await authReq.json();
  const accessToken = authenBody.token;

  const newPayloadJson = generateValidJsonBookingPayload();
  const updateBookingReq = await request.put(BOOKING_URL + `/${bookingId}`, {
    data: newPayloadJson,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: `token=${accessToken}`,
    },
  });

  //assert
  await expect(updateBookingReq.status()).toBe(200);
  const jsonBody = await updateBookingReq.json();
  expect(tv4.validate(jsonBody, schema, true)).toBeTruthy();

  expect(jsonBody.firstname).toBe(newPayloadJson.firstname);
  expect(jsonBody.lastname).toBe(newPayloadJson.lastname);
  expect(jsonBody.totalprice).toBe(newPayloadJson.totalprice);
  expect(jsonBody.depositpaid).toBe(newPayloadJson.depositpaid);
  expect(JSON.stringify(jsonBody.bookingdates)).toBe(
    JSON.stringify(newPayloadJson.bookingdates)
  );
});

test("Update existing booking with Xml payload", async ({ request }) => {
  //arrange
  const schema = `
    <xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="booking">
    <xs:complexType>
      <xs:sequence>
        <xs:element type="xs:string" name="firstname"/>
        <xs:element type="xs:string" name="lastname"/>
        <xs:element type="xs:integer" name="totalprice"/>
        <xs:element type="xs:string" name="depositpaid"/>
        <xs:element name="bookingdates">
          <xs:complexType>
            <xs:sequence>
              <xs:element type="xs:date" name="checkin"/>
              <xs:element type="xs:date" name="checkout"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
    `;
  const createPayloadXml = generateValidXmlBookingPayload();

  const createdBookReq = await request.post(BOOKING_URL, {
    data: createPayloadXml,
    headers: {
      "Content-Type": "text/xml",
      Accept: "application/xml",
    },
  });
  await expect(createdBookReq.status()).toBe(200);
  const createBookResp = await createdBookReq.text();
  const createBookRespInXml = await xml2js.parseStringPromise(createBookResp, {
    explicitArray: false,
  });

  const bookingId = createBookRespInXml["created-booking"].bookingid;

  // act
  const authReq = await request.post(AUTH_URL, {
    data: {
      username: "admin",
      password: "password123",
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
  const authenBody = await authReq.json();
  const accessToken = authenBody.token;

  const newPayloadXml = generateValidXmlBookingPayload();
  const updateBookingReq = await request.put(BOOKING_URL + `/${bookingId}`, {
    data: newPayloadXml,
    headers: {
      "Content-Type": "text/xml",
      Accept: "application/xml",
      Cookie: `token=${accessToken}`,
    },
  });

  //assert
  await expect(updateBookingReq.status()).toBe(200);
  const updateBookingReqText = await updateBookingReq.text();
  const updateBookingReqInXml = await xml2js.parseStringPromise(
    updateBookingReqText,
    {
      explicitArray: false,
    }
  );

  const isMatchedToSchema = xmlSchemaValidator(updateBookingReqText, schema);
  expect(isMatchedToSchema).toBeTruthy();

  const updatePayloadXmlAfterParsing = await xml2js.parseStringPromise(
    newPayloadXml.toString(),
    {
      explicitArray: false,
    }
  );

  expect(JSON.stringify(updatePayloadXmlAfterParsing)).toBe(
    JSON.stringify(updateBookingReqInXml)
  );
});

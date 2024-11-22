import { test, expect } from "@playwright/test";
import tv4 from "tv4";
import * as xml2js from "xml2js";

import { default as xmlSchemaValidator } from "xsd-validator";
import { generateValidJsonBookingPayload, generateValidXmlBookingPayload } from "../data/helper/generateData";

const URL = "/booking";

/**
 * @typedef BookPayload
 * @property {String} firstname
 * @property {String} lastname
 * @property {Number} totalprice
 * @property {boolean} depositpaid
 * @property {{checkin: string, checkout: string}} bookingdates
 *
 */

/**
 * @type {BookPayload}
 */
let createPayloadJson;

let createPayloadXml;
/**
 * @type {unknown}
 */
let createBookRespJson;
/**
 * @type {unknown}
 */
let createBookRespXml;

test.beforeAll(async ({ request }) => {


  createPayloadJson = generateValidJsonBookingPayload()

  createPayloadXml = generateValidXmlBookingPayload();

  const createdBookReqJson = await request.post(URL, {
    data: { ...createPayloadJson },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  await expect(createdBookReqJson.status()).toBe(200);
  createBookRespJson = await createdBookReqJson.json();

  const createdBookReqXml = await request.post(URL, {
    data: createPayloadXml,
    headers: {
      "Content-Type": "text/xml",
      Accept: "application/xml",
    },
  });
  await expect(createdBookReqXml.status()).toBe(200);
  createBookRespXml = await createdBookReqXml.text();
});

test("Response returns 200 when using application/json header", async ({
  request,
}) => {
  const bookingId = createBookRespJson.bookingid;
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

  const getBookReq = await request.get(URL + `/${bookingId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  await expect(getBookReq.status()).toBe(200);
  const jsonBody = await getBookReq.json();
  expect(tv4.validate(jsonBody, schema, true)).toBeTruthy();
});

test("Response returns 200 when using application/xml header", async ({
  request,
}) => {
  let bookingId;
  xml2js.parseString(
    createBookRespXml,
    {
      explicitArray: false,
    },
    (err, xmlData) => {
      if (err) expect(true).toBeFalsy();

      const data = xmlData["created-booking"];
      expect(data).toHaveProperty("bookingid");
      bookingId = data.bookingid;
    }
  );

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

  const getBookReq = await request.get(URL + `/${bookingId}`, {
    headers: {
      "Content-Type": "text/xml",
      Accept: "application/xml",
    },
  });

  await expect(getBookReq.status()).toBe(200);
  const xmlRes = await getBookReq.text();
  const isMatchedToSchema = xmlSchemaValidator(xmlRes, schema);
  expect(isMatchedToSchema).toBeTruthy();
});

test("Response body returns correct information", async ({ request }) => {
  const bookingId = createBookRespJson.bookingid;
  const getBookReq = await request.get(URL + `/${bookingId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  await expect(getBookReq.status()).toBe(200);
  const jsonBody = await getBookReq.json();

  expect(jsonBody.firstname).toBe(createBookRespJson.booking.firstname);
  expect(jsonBody.lastname).toBe(createBookRespJson.booking.lastname);
  expect(jsonBody.totalprice).toBe(createBookRespJson.booking.totalprice);
  expect(jsonBody.depositpaid).toBe(createBookRespJson.booking.depositpaid);
  expect(JSON.stringify(jsonBody.bookingdates)).toBe(
    JSON.stringify(createBookRespJson.booking.bookingdates)
  );
});

test("Response body returns 404 for non-existing book", async ({ request }) => {
  const nonExistingBook = 999999;
  const getBookReq = await request.get(URL + `/${nonExistingBook}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  await expect(getBookReq.status()).toBe(404);
});

test("Response body returns 400 when input `%s` as bookingid", async ({ request }) => {
    const invalidChar = "%s";
    const getBookReq = await request.get(URL + `/${invalidChar}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    await expect(getBookReq.status()).toBe(400);
  });

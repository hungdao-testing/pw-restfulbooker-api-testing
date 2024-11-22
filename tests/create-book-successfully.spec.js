import { test, expect } from '@playwright/test'
import * as xml2js from 'xml2js';
import { generateValidJsonBookingPayload, generateValidXmlBookingPayload } from '../data/helper/generateData';


const CREAT_BOOK_URL = "/booking";

const sampleBookingPayloadJson = generateValidJsonBookingPayload();
const sampleBookingPayloadXml = generateValidXmlBookingPayload();

test('return 200 when using json header and payload ', async ({ request }) => {

    // create book
    const createBookReq = await request.post(CREAT_BOOK_URL, {
        data: { ...sampleBookingPayloadJson, "additionalneeds": "Breakfast" },
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    })

    // assert
    expect(createBookReq.status()).toBe(200);
    const createBookResp = await createBookReq.json();
    expect({ ...createBookResp }).toEqual(expect.objectContaining({ bookingid: expect.any(Number) }));

})

test('return 200 when using xml header and payload ', async ({ request }) => {


    // create book
    const createBookReq = await request.post(CREAT_BOOK_URL, {
        data: sampleBookingPayloadXml,
        headers: {
            "Content-Type": "text/xml",
            "Accept": "application/xml",
        }
    })

    // // assert
    expect(createBookReq.status()).toBe(200);
    const createBookResp = await createBookReq.text();
    xml2js.parseString(createBookResp, {
        // explicitCharkey: true,
        // explicitRoot: true,
        explicitArray: false,
        // ignoreAttrs : true
        // charkey: "textContent"
    }, (err, xmlData) => {
        if (err) expect(true).toBeFalsy();

        const responseInJson = xmlData['created-booking'];
        expect(responseInJson).toHaveProperty("bookingid");
        expect(responseInJson.bookingid.length).toBeGreaterThan(1)

    });


})

test('response returns 200 when input only required information in payload', async ({ request }) => {
    const createBookReq = await request.post(CREAT_BOOK_URL, {
        data: sampleBookingPayloadJson,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    })

    // assert
    expect(createBookReq.status()).toBe(200);
    const createBookResp = await createBookReq.json();
    expect({ ...createBookResp }).toEqual(expect.objectContaining({ bookingid: expect.any(Number) }));
})
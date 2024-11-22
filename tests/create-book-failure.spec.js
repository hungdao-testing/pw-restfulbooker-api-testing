import { test, expect } from '@playwright/test'



const CREAT_BOOK_URL = "/booking";

const sampleBookingPayloadJson = {
    "firstname": "Jim",
    "lastname": "Brown",
    "totalprice": 111,
    "depositpaid": true,
    "bookingdates": {
        "checkin": "2018-01-01",
        "checkout": "2019-01-01"
    }

};

const sampleBookingPayloadXml =
    `<booking>
    <firstname>Jim</firstname>
    <lastname>Brown</lastname>
    <totalprice>111</totalprice>
    <depositpaid>true</depositpaid>
    <bookingdates>
      <checkin>2018-01-01</checkin>
      <checkout>2019-01-01</checkout>
    </bookingdates>
    <additionalneeds>Breakfast</additionalneeds>
  </booking>`;

test('Response returns 400 when using json header but xml payload ', async ({ request }) => {

    // create book
    const createBookReq = await request.post(CREAT_BOOK_URL, {
        data: sampleBookingPayloadXml,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    })

    // assert
    expect(createBookReq.status()).toBe(400);

})

test('Response returns 400 when using xml header but json payload ', async ({ request }) => {


    // create book
    const createBookReq = await request.post(CREAT_BOOK_URL, {
        data: sampleBookingPayloadJson,
        headers: {
            "Content-Type": "text/xml",
            "Accept": "application/xml",
        }
    })

    // // assert
    expect(createBookReq.status()).toBe(400);



})

test('Response returns 500 when missing name information in payload', async ({ request }) => {

    // create book
    const createBookReq = await request.post(CREAT_BOOK_URL, {
        data: {
            "totalprice": 111,
            "depositpaid": true,
            "bookingdates": {
                "checkin": "2018-01-01",
                "checkout": "2019-01-01"
            }
        },
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    })

    // assert
    expect(createBookReq.status()).toBe(500);

})

test('Response returns 500 when missing price information in payload', async ({ request }) => {

    // create book
    const createBookReq = await request.post(CREAT_BOOK_URL, {
        data: {

            "firstname": "Jim",
            "lastname": "Brown",
            "depositpaid": true,
            "bookingdates": {
                "checkin": "2018-01-01",
                "checkout": "2019-01-01"
            }
        },
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    })

    // assert
    expect(createBookReq.status()).toBe(500);

})

test('return 500 when missing bookingdates information in payload', async ({ request }) => {

    // create book
    const createBookReq = await request.post(CREAT_BOOK_URL, {
        data: {

            "firstname": "Jim",
            "lastname": "Brown",
            "totalprice": 111,
            "depositpaid": true,

        },
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    })

    // assert
    expect(createBookReq.status()).toBe(500);

})
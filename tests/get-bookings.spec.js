import { test, expect } from '@playwright/test'
import tv4 from 'tv4';
import moment from 'moment'
import { faker } from '@faker-js/faker';


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
let createPayload;

/**
 * @type {Promise<import('@playwright/test').Response>}
 */
let createBookResp;


test.beforeAll(async({request}) => {
    const now = moment().format("YYYY-MM-DD");
    const nextOneWeek = moment().add(1, 'week').format("YYYY-MM-DD")


    createPayload = {
        "firstname": faker.person.firstName(),
        "lastname": faker.person.lastName(),
        "totalprice": faker.number.int() * 2,
        "depositpaid": true,
        "bookingdates": {
            "checkin": now,
            "checkout":nextOneWeek
        }
    }
   

    const createdBookReq = await request.post(URL, {
        data: { ...createPayload},
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    })
     createBookResp = await createdBookReq.json();

})

test('Response returns 200 with valid schema', async ({ request }) => {
    const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Generated schema for Root",
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "bookingid": {
                    "type": "number"
                }
            },
            "required": [
                "bookingid"
            ]
        }
    }
    const getBooksReq = await request.get(URL, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    await expect(getBooksReq.status()).toBe(200);
    const jsonBody = await getBooksReq.json();
    expect(tv4.validate(jsonBody, schema, true)).toBeTruthy()
})

test('Filter bookings by name', async ({ request }) => {
    

    const filterURL = URL + `?firstname=${createPayload.firstname}&lastname=${createPayload.lastname}`
    const getBooksReq = await request.get(filterURL, {
        headers: {
            "Content-Type": "application/json"
        }
    });


    await expect(getBooksReq.status()).toBe(200);
    const getBookResp = await getBooksReq.json();
    await expect(getBookResp.length).toBeGreaterThanOrEqual(1);
    const filterId = getBookResp.filter(book => book.bookingid === createBookResp.bookingid);
    expect(filterId.length).toBeGreaterThanOrEqual(1)
})

test.fail('Filter bookings by date', async ({ request }) => {


    const filterURL = URL + `?checkin=${createPayload.bookingdates.checkin}&checkout=${createPayload.bookingdates.checkout}`

    console.log(filterURL)
    const getBooksReq = await request.get(filterURL, {
        headers: {
            "Content-Type": "application/json"
        }
    });


    await expect(getBooksReq.status()).toBe(200);
    const getBookResp = await getBooksReq.json();
    await expect(getBookResp.length).toBe(1);
    const filterId = getBookResp.filter(book => book.bookingid === createBookResp.bookingid);
    expect(filterId.length).toBe(1)
})
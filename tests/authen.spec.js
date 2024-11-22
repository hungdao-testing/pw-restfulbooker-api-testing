import { test, expect } from '@playwright/test'


const AUTH_URL = "/auth";

test.describe("Authentication", () => {
    test('Response returns 200', async ({ request }) => {

        const authReq = await request.post(AUTH_URL, {
            data: {
                username: "admin",
                password: "password123"
            },
            headers: {
                "Content-Type": "application/json"
            }
        });
        const jsonBody = await authReq.json();
        expect(authReq.status()).toBe(200);
        expect(jsonBody).toEqual(expect.objectContaining({ token: expect.any(String) }))
        expect(jsonBody.token.length).toBeGreaterThan(1)
    });

    test('Response returns error message when input invalid credential', async ({ request }) => {

        const authReq = await request.post(AUTH_URL, {
            data: {
                username: "admin1",
                password: "password123"
            },
            headers: {
                "Content-Type": "application/json"
            }
        });
        const jsonBody = await authReq.json();
        expect(authReq.status()).toBe(200);
        expect(jsonBody).toMatchObject({
            reason: "Bad credentials",
        })


    });

    test('Response returns 400 for unsupported header', async ({ request }) => {

        const authReq = await request.post(AUTH_URL, {
            data: {
                username: "admin",
                password: "password123"
            },
            headers: {
                "Content-Type": "text/xml"
            }
        });

        expect(authReq.status()).toBe(400);

    });
})


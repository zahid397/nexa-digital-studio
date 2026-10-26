import config from '@payload-config'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'
export const GET = REST_GET(config)
const payloadPOST = REST_POST(config)
export const POST: typeof payloadPOST = (request: Request, context) => {
  if (new URL(request.url).pathname.replace(/\/$/, '').endsWith('/users/first-register')) {
    return Promise.resolve(
      Response.json(
        {
          errors: [
            {
              message:
                'Public administrator registration is disabled. Use the secure owner setup script.',
            },
          ],
        },
        { status: 403 },
      ),
    )
  }
  return payloadPOST(request, context)
}
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)

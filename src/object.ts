import { z } from "zod"

const ObjectSchema = z.object({
  class: z.string(),
  number: z.number().min(1),
})

type Object = z.infer<typeof ObjectSchema>

class ObjectDO implements DurableObject {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async get(request: Request): Promise<Response> {
    const state = await this.state.storage.get("data")
    const data = state ? (state as string) : "{}"

    return new Response(
      data,
      { headers: { 'Content-type': 'application/json' } }
    )
  }

  async put(request: Request): Promise<Response> {
    let body
    try {
      body = await request.json()
    } catch (err) {
      return new Response("Expected JSON", { status: 500 })
    }

    try {
      const object: Object = ObjectSchema.parse(body)
      await this.state.storage.put("data", JSON.stringify(object))

      return new Response(
        JSON.stringify(object),
        {
          headers: { 'Content-type': 'application/json' }
        }
      )
    } catch (err) {
      if (typeof err.format == "function") {
        const formattedError = err.format()
        return new Response(
          JSON.stringify(formattedError),
          {
            headers: { 'Content-type': 'application/json' },
            status: 500
          }
        )
      }

      return new Response(
        err.toString(),
        { status: 500 }
      )
    }
  }

  async fetch(request: Request): Promise<Response> {
    switch (request.method) {
      case 'GET':
        return this.get(request)
      case 'POST':
        return this.put(request)
      default:
        return new Response("Method not allowed", { status: 405 })
    }

  }
}

export default ObjectDO
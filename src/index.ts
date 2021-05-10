import Object from './object'

type Environment = {
  OBJECT: DurableObjectNamespace
}

export default {
  async fetch(request: Request, env: Environment) {
    const url = new URL(request.url)
    if (url.pathname.length === 1) return new Response("Provide ID")

    const [_slash, id] = url.pathname.split("/")
    const obj = env.OBJECT.get(env.OBJECT.idFromName(id))
    return await obj.fetch(request)
  }
}

export { Object }
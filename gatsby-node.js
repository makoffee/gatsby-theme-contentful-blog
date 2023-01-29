const path = require("path")
const { documentToHtmlString } = require("@contentful/rich-text-html-renderer")

exports.createSchemaCustomization = async ({ actions }) => {
  // todo: check if field extension exists
  actions.createFieldExtension({
    name: "contentfulRichText",
    extend(options) {
      return {
        resolve(source, args, context, info) {
          const body = source.body
          const doc = JSON.parse(body.raw)
          const html = documentToHtmlString(doc)
          return html
        },
      }
    },
  })

  actions.createFieldExtension({
    name: "contentfulExcerpt",
    extend(options) {
      return {
        async resolve(source, args, context, info) {
          const type = info.schema.getType(source.internal.type)
          const resolver = type.getFields().contentfulExcerpt?.resolve
          const result = await resolver(source, args, context, {
            fieldName: "contentfulExcerpt",
          })
          return result.excerpt
        },
      }
    },
  })

  actions.createFieldExtension({
    name: "urlSchema",
    extend(options) {
      const schemaRE = /^\/\//
      const addURLSchema = (str) => {
        if (schemaRE.test(str)) return `https:${str}`
        return str
      }
      return {
        resolve(source) {
          return addURLSchema(source.file.url)
        },
      }
    },
  })

  actions.createTypes(/* GraphQL */ `

    type contentfulBlogPostExcerptTextNode implements Node {
      id: ID!
      excerpt: String!
      # determine if markdown is required for this field type
    }
 
  `)
}

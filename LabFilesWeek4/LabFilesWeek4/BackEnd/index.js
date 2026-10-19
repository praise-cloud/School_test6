const express = require('express')
const products = require('../FrontEnd/products.js')

const app = express()
const orders = []
let nextOrderId = 1

app.use(express.json())
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`)
  next()
})

app.get('/products', (req, res) => {
  res.json(products)
})

// this is the routing with the parameter
app.get('/products/:id', (req, res) => {
  const productId = Number(req.params.id)
  const product = products.find((item) => item.id === productId)

  if (!Number.isInteger(productId) || !product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  res.json(product)
})

app.post('/orders', (req, res) => {
  const { title, firstname, lastname, telephone, items } = req.body ?? {}
  const customerFields = [title, firstname, lastname, telephone]

  if (
    !customerFields.every((field) => typeof field === 'string' && field.trim()) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      error: 'Provide title, firstname, lastname, telephone, and at least one item.',
    })
  }

  const quantities = new Map()
  for (const item of items) {
    const productId = typeof item === 'number' ? item : item?.id
    const quantity = typeof item === 'number' ? 1 : item?.quantity

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        error: 'Each item must have an integer id and a positive integer quantity.',
      })
    }

    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity)
  }

  const orderItems = []
  for (const [productId, quantity] of quantities) {
    const product = products.find((item) => item.id === productId)

    if (!product) {
      return res.status(400).json({ error: `Unknown product id: ${productId}` })
    }
    if (quantity > product.availableInventory) {
      return res.status(409).json({
        error: `Not enough inventory for product id: ${productId}`,
      })
    }

    orderItems.push({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity,
    })
  }

  const order = {
    id: nextOrderId++,
    customer: {
      title: title.trim(),
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      telephone: telephone.trim(),
    },
    items: orderItems,
    total: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }

  for (const item of orderItems) {
    const product = products.find((entry) => entry.id === item.id)
    product.availableInventory -= item.quantity
  }

  orders.push(order)
  res.status(201).json(order)
})

app.get('/orders/:id', (req, res) => {
  const orderId = Number(req.params.id)
  const order = orders.find((item) => item.id === orderId)

  if (!Number.isInteger(orderId) || !order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  res.json(order)
})

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

if (require.main === module) {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Pet store API listening on port ${port}`)
  })
}

module.exports = app

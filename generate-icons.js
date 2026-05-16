#!/usr/bin/env node
// Script to generate PWA icons programmatically using SVG + Canvas
// Run: node generate-icons.js

const { createCanvas } = require("canvas")
const fs = require("fs")
const path = require("path")

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext("2d")

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, size, size)
  bgGrad.addColorStop(0, "#4f46e5") // indigo-600
  bgGrad.addColorStop(0.5, "#7c3aed") // violet-600
  bgGrad.addColorStop(1, "#db2777") // pink-600

  const radius = size * 0.22
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.arcTo(size, 0, size, radius, radius)
  ctx.lineTo(size, size - radius)
  ctx.arcTo(size, size, size - radius, size, radius)
  ctx.lineTo(radius, size)
  ctx.arcTo(0, size, 0, size - radius, radius)
  ctx.lineTo(0, radius)
  ctx.arcTo(0, 0, radius, 0, radius)
  ctx.closePath()
  ctx.fillStyle = bgGrad
  ctx.fill()

  // Draw graduation cap emoji style icon
  const scale = size / 512
  ctx.fillStyle = "rgba(255,255,255,0.95)"

  const cx = size / 2
  const cy = size * 0.45

  // Cap board (flat part)
  const capW = size * 0.58
  const capH = size * 0.12
  const capY = cy - size * 0.05

  // Rotated diamond/rhombus for cap top
  ctx.save()
  ctx.translate(cx, capY)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-capH / 1.5, -capH / 1.5, capH * 1.33, capH * 1.33)
  ctx.restore()

  // Draw book-like shape below
  const bookW = size * 0.38
  const bookH = size * 0.28
  const bookX = cx - bookW / 2
  const bookY = cy + size * 0.06

  ctx.beginPath()
  ctx.roundRect(bookX, bookY, bookW, bookH, size * 0.04)
  ctx.fill()

  // Book lines
  ctx.fillStyle = "rgba(99, 102, 241, 0.7)"
  const lineW = bookW * 0.6
  const lineX = cx - lineW / 2
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(lineX, bookY + bookH * (0.25 + i * 0.22), lineW, size * 0.018)
  }

  // Tassel
  ctx.fillStyle = "rgba(255,255,255,0.9)"
  ctx.fillRect(cx + capW * 0.26, capY - size * 0.02, size * 0.025, size * 0.12)
  ctx.beginPath()
  ctx.arc(cx + capW * 0.26 + size * 0.012, capY + size * 0.1, size * 0.025, 0, Math.PI * 2)
  ctx.fill()

  return canvas.toBuffer("image/png")
}

const iconsDir = path.join(__dirname, "public", "icons")
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

sizes.forEach((size) => {
  try {
    const buf = generateIcon(size)
    fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), buf)
    console.log(`✓ Generated icon-${size}x${size}.png`)
  } catch (e) {
    console.log(`⚠ Skipped ${size}x${size} (canvas not available, will use SVG fallback)`)
  }
})

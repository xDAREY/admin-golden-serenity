import { NextResponse } from "next/server"
import { format } from "date-fns"
import jsPDF from "jspdf"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { application } = await req.json()

    if (!application || !application.fullName) {
      return NextResponse.json({ error: "Missing application data" }, { status: 400 })
    }

    
    const doc = new jsPDF()
    let yPosition = 20

    // Helper function to add text and move position
    const addText = (text: string, fontSize = 12, isBold = false) => {
      doc.setFontSize(fontSize)
      if (isBold) {
        doc.setFont(undefined, 'bold')
      } else {
        doc.setFont(undefined, 'normal')
      }
      doc.text(text, 20, yPosition)
      yPosition += fontSize * 0.4 + 2
    }

    // Header
    addText("Golden Serenity Job Application", 24, true)
    yPosition += 5
    
    addText(`Submitted: ${format(new Date(application.createdAt), "MMMM dd, yyyy 'at' h:mm a")}`, 14)
    yPosition += 5

    addText(`Status: ${(application.status || "new").toUpperCase()}`, 12, true)
    yPosition += 10

    // Personal Info
    addText("Personal Information", 16, true)
    addText(`Full Name: ${application.fullName}`)
    addText(`Email: ${application.email}`)
    addText(`Phone: ${application.phone || "Not provided"}`)
    addText(`Availability: ${application.availability || "Not specified"}`)
    addText(`Contact Info: ${application.contactInformation || "N/A"}`)
    yPosition += 10

    // Education
    if (application.educationBackground) {
      addText("Education Background", 16, true)
      // Split long text into multiple lines
      const lines = doc.splitTextToSize(application.educationBackground, 170)
      lines.forEach((line: string) => addText(line))
      yPosition += 10
    }

    // References
    if (application.references) {
      addText("References", 16, true)
      const lines = doc.splitTextToSize(application.references, 170)
      lines.forEach((line: string) => addText(line))
      yPosition += 10
    }

    // Resume
    if (application.resumeUrl) {
      addText("Resume", 16, true)
      addText(application.resumeUrl)
      yPosition += 10
    }

    // Footer
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generated on ${format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}`,
      105,
      280,
      { align: 'center' }
    )

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="application-${application.fullName.replace(/\s+/g, "-")}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
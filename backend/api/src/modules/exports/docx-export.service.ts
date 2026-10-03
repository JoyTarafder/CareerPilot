import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { ResumeContentSnapshot } from '@careerpilot/contracts';

export class DocxExportService {
  /**
   * Generates a Microsoft Word (.docx) document from an immutable ResumeContentSnapshot.
   */
  async generateDocx(resume: ResumeContentSnapshot): Promise<Buffer> {
    const { personalInfo, summary, educations, experiences, projects, skills } = resume;

    const sectionsChildren: Paragraph[] = [];

    // Header: Full Name
    sectionsChildren.push(
      new Paragraph({
        text: personalInfo.fullName,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      })
    );

    // Contact info line
    const contactParts = [
      personalInfo.email,
      personalInfo.phoneNumber,
      personalInfo.location,
      personalInfo.linkedinUrl,
      personalInfo.githubUrl,
      personalInfo.portfolioUrl,
    ].filter(Boolean);

    sectionsChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 20, // 10pt
            color: '454B48',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        border: {
          bottom: {
            color: 'DDE2DC',
            space: 6,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    // Summary Section
    if (summary) {
      this.addSectionHeader(sectionsChildren, 'PROFESSIONAL SUMMARY');
      sectionsChildren.push(
        new Paragraph({
          children: [new TextRun({ text: summary, size: 21 })],
          spacing: { after: 200 },
        })
      );
    }

    // Skills Section
    if (skills && skills.length > 0) {
      this.addSectionHeader(sectionsChildren, 'SKILLS');
      for (const group of skills) {
        sectionsChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${group.category}: `, bold: true, size: 21 }),
              new TextRun({ text: group.items.join(', '), size: 21 }),
            ],
            spacing: { after: 100 },
          })
        );
      }
      sectionsChildren.push(new Paragraph({ spacing: { after: 100 } }));
    }

    // Experience Section
    if (experiences && experiences.length > 0) {
      this.addSectionHeader(sectionsChildren, 'EXPERIENCE');
      for (const exp of experiences) {
        sectionsChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${exp.role} — ${exp.company}`, bold: true, size: 22 }),
              new TextRun({
                text: `\t${exp.startDate} – ${exp.isCurrent ? 'Present' : exp.endDate || ''}`,
                size: 20,
                color: '454B48',
              }),
            ],
            spacing: { before: 80, after: 40 },
          })
        );

        if (exp.location) {
          sectionsChildren.push(
            new Paragraph({
              children: [new TextRun({ text: exp.location, italics: true, size: 20, color: '454B48' })],
              spacing: { after: 60 },
            })
          );
        }

        if (exp.description) {
          sectionsChildren.push(
            new Paragraph({
              children: [new TextRun({ text: exp.description, size: 21 })],
              spacing: { after: 60 },
            })
          );
        }

        for (const highlight of exp.highlights) {
          sectionsChildren.push(
            new Paragraph({
              text: highlight,
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          );
        }
      }
      sectionsChildren.push(new Paragraph({ spacing: { after: 100 } }));
    }

    // Projects Section
    if (projects && projects.length > 0) {
      this.addSectionHeader(sectionsChildren, 'PROJECTS');
      for (const proj of projects) {
        sectionsChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.title, bold: true, size: 22 }),
              ...(proj.url
                ? [new TextRun({ text: `\t${proj.url}`, size: 19, color: '175C4C' })]
                : []),
            ],
            spacing: { before: 80, after: 40 },
          })
        );

        if (proj.description) {
          sectionsChildren.push(
            new Paragraph({
              children: [new TextRun({ text: proj.description, size: 21 })],
              spacing: { after: 40 },
            })
          );
        }

        if (proj.technologies && proj.technologies.length > 0) {
          sectionsChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Technologies: ', bold: true, size: 19, color: '454B48' }),
                new TextRun({ text: proj.technologies.join(', '), size: 19 }),
              ],
              spacing: { after: 80 },
            })
          );
        }
      }
      sectionsChildren.push(new Paragraph({ spacing: { after: 100 } }));
    }

    // Education Section
    if (educations && educations.length > 0) {
      this.addSectionHeader(sectionsChildren, 'EDUCATION');
      for (const edu of educations) {
        sectionsChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${edu.degree} in ${edu.fieldOfStudy}`, bold: true, size: 22 }),
              new TextRun({
                text: `\t${edu.startDate} – ${edu.isCurrent ? 'Present' : edu.endDate || ''}`,
                size: 20,
                color: '454B48',
              }),
            ],
            spacing: { before: 80, after: 40 },
          })
        );

        sectionsChildren.push(
          new Paragraph({
            children: [new TextRun({ text: edu.institution, italics: true, size: 20, color: '454B48' })],
            spacing: { after: 40 },
          })
        );

        if (edu.description) {
          sectionsChildren.push(
            new Paragraph({
              children: [new TextRun({ text: edu.description, size: 21 })],
              spacing: { after: 60 },
            })
          );
        }
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1000,
                right: 1000,
                bottom: 1000,
                left: 1000,
              },
            },
          },
          children: sectionsChildren,
        },
      ],
    });

    return Packer.toBuffer(doc);
  }

  private addSectionHeader(children: Paragraph[], title: string): void {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 24, // 12pt
            color: '175C4C',
          }),
        ],
        spacing: { before: 180, after: 80 },
        border: {
          bottom: {
            color: 'DDE2DC',
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
  }
}

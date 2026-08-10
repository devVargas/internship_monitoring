import type { SectionProps } from '../documentFormTypes.ts'
import ActivityValidationSections from './ActivityValidationSections.tsx'

export default function NonMandatoryInternshipCreditSections(props: SectionProps) {
  return <ActivityValidationSections {...props} includeRequestData />
}

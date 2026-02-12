import { Location, EducationLevel, Gender } from '@/types'

export const mapGenderTH = (g: Gender | null) => {
  switch (g) {
    case 'male':
      return 'ชาย'
    case 'female':
      return 'หญิง'
    default:
      return 'ไม่ระบุ'
  }
}

export const mapLocationTH = (loc: Location | null) => {
  switch (loc) {
    case 'home':
      return 'พักอาศัยที่บ้าน'
    case 'nursing_home':
      return 'สถานดูแลผู้สูงอายุ'
    case 'hospital':
      return 'โรงพยาบาล'
    default:
      return 'ไม่ระบุ'
  }
}

export const mapEducationTH = (edu: EducationLevel | null) => {
  switch (edu) {
    case 'below_p4':
      return 'ต่ำกว่าประถมศึกษาปีที่ 4'
    case 'p4_or_above':
      return 'ประถมศึกษาปีที่ 4 ขึ้นไป'
    default:
      return 'ไม่ระบุ'
  }
}
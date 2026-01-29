import PatientDetailClient from '@/components/admin/PatientDetailClient'
import { PatientRecord } from '@/types'

const MOCK_PATIENTS: PatientRecord[] = [
  {
    id: 'p-0001',
    volunteersId: 'ก001',
    timestamp: '2024-05-20T10:30:00',
    demographics: {
        currentLocationDescription: 'ลาดพร้าว จตุจักร กรุงเทพฯ 10900',
        age: '72',
        gender: 'female',
        locationType: 'home',
        educationLevel: 'below_p4'
    },
    miniCog: {
      wordRegistration: ['บ้าน', 'ดอกไม้', 'รถ'],
      clockImage: null, 
      recalledWords: ['บ้าน', 'รถ'],
      recallScore: 2,
      score: 3 
    },
    tgds: { score: 4 },
    status: 'normal'
  },
  {
    id: 'p-0002',
    volunteersId: 'ก002',
    timestamp: '2024-05-22T09:00:00',
    demographics: {
        currentLocationDescription: 'พหลโยธิน พญาไท กรุงเทพฯ 10400',
        age: '68',
        gender: 'male',
        locationType: 'home',
        educationLevel: 'below_p4'
    },
    miniCog: {
      wordRegistration: ['ลูกบอล', 'ธงชาติ', 'ต้นไม้'],
      clockImage: null,
      recalledWords: ['ลูกบอล', 'ธงชาติ', 'ต้นไม้'],
      recallScore: 3,
      score: 5
    },
    tgds: { score: 12 },
    status: 'high-risk'
  }
];


interface PageProps {
  params: Promise<{
    id: string
  }>
}


export default async function Page({ params }: PageProps) {
  const { id } = await params  
  console.log(id)
  const patient = MOCK_PATIENTS.find(p => p.id === id)


  if (!patient) {
    return (
      <div className="p-10 text-center text-gray-500">
        ไม่พบข้อมูลผู้ป่วย
      </div>
    )
  }

  return <PatientDetailClient patient={patient} />
}
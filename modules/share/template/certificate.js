import { aliOssHost } from '../../../common/config/api'

export default function (data, type) {
  const { qrcode, userInfo } = data

  switch (type) {
    case 'block-chain': {
      // 区块链证书的海报的y轴偏了3px
      const bgImg = `${aliOssHost}/poster-normal-bg.png`
      const zheImg = `${aliOssHost}/poster-normal-zhe.png`
      const customHeight = 3

      const getNameInfo = name => {
        let fontSize = 72
        let length = name.length
        const letterSpace = 16
        const nameWidth = 496
        const posterWidth = 750
        const yAxis = 718 + customHeight

        const computePosition = () => {
          let firstX = (posterWidth - nameWidth) / 2 + (nameWidth - (fontSize * length + letterSpace * (length - 1))) / 2

          const res = name.split('').map((char, idx) => {
            if (idx === 0) {
              return { type: 'text', line: char, x: firstX, y: yAxis, fontSize, fontColor: '#FFFFFF', width: nameWidth, fontWeight: 'bold' }
            }
            return { type: 'text', line: char, x: (firstX += fontSize + letterSpace), y: yAxis, fontSize, fontColor: '#FFFFFF', width: nameWidth, fontWeight: 'bold' }
          })

          return res
        }

        if (length > 4) {
          fontSize = 48

          if (length > 8) {
            name = name.substring(0, 8)

            length = name.length
          }
        }

        return computePosition()
      }

      const elements = [
        { type: 'image', url: bgImg, x: 0, y: 0, width: 750, height: 1334, clip: false },
        { type: 'image', url: qrcode, x: 289, y: 1064, width: 172, height: 172, clip: true },
        { type: 'image', url: zheImg, x: 265, y: 1040, width: 220, height: 220, clip: false },
        ...getNameInfo(userInfo.name),
        { type: 'text', line: userInfo.digiId, x: 326, y: 861 + customHeight, fontSize: 24, fontColor: '#FFFFFF', width: 250 },
        { type: 'text', line: userInfo.idCard, x: 326, y: 919 + customHeight, fontSize: 24, fontColor: '#FFFFFF', width: 250 },
        { type: 'text', line: userInfo.hash, x: 326, y: 977 + customHeight, fontSize: 24, fontColor: '#FFFFFF', width: 250 },
      ]

      return {
        width: 750,
        height: 1334,
        background: { color: '#ffffff' },
        elements,
      }
    }
    case 'dangyuan-block-chain': {
      // 区块链证书的海报的y轴偏了3px
      const bgImg = `${aliOssHost}/poster-dangyuan-bg.png`
      const zheImg = `${aliOssHost}/poster-dangyuan-zhe.png`
      const customHeight = 3

      const getNameInfo = name => {
        let fontSize = 72
        let length = name.length
        const letterSpace = 16
        const nameWidth = 496
        const posterWidth = 750
        const yAxis = 718 + customHeight

        const computePosition = () => {
          let firstX = (posterWidth - nameWidth) / 2 + (nameWidth - (fontSize * length + letterSpace * (length - 1))) / 2

          const res = name.split('').map((char, idx) => {
            if (idx === 0) {
              return { type: 'text', line: char, x: firstX, y: yAxis, fontSize, fontColor: '#ffe0a6', width: nameWidth, fontWeight: 'bold' }
            }
            return { type: 'text', line: char, x: (firstX += fontSize + letterSpace), y: yAxis, fontSize, fontColor: '#ffe0a6', width: nameWidth, fontWeight: 'bold' }
          })

          return res
        }

        if (length > 4) {
          fontSize = 48

          if (length > 8) {
            name = name.substring(0, 8)

            length = name.length
          }
        }

        return computePosition()
      }

      const elements = [
        { type: 'image', url: bgImg, x: 0, y: 0, width: 750, height: 1334, clip: false },
        { type: 'image', url: qrcode, x: 289, y: 1064, width: 172, height: 172, clip: true },
        { type: 'image', url: zheImg, x: 265, y: 1040, width: 220, height: 220, clip: false },
        ...getNameInfo(userInfo.name),
        { type: 'text', line: userInfo.digiId, x: 326, y: 861 + customHeight, fontSize: 24, fontColor: '#ffe0a6', width: 250 },
        { type: 'text', line: userInfo.idCard, x: 326, y: 919 + customHeight, fontSize: 24, fontColor: '#ffe0a6', width: 250 },
        { type: 'text', line: userInfo.hash, x: 326, y: 977 + customHeight, fontSize: 24, fontColor: '#ffe0a6', width: 250 },
      ]

      return {
        width: 750,
        height: 1334,
        background: { color: '#ffffff' },
        elements,
      }
    }
    default:
      break
  }
}

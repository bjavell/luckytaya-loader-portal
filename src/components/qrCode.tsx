import { NextPage } from "next"
import { useQRCode } from "next-qrcode"

const QrCode: NextPage<{ data: string, className?: string }> = (props) => {
    const { Canvas } = useQRCode()

    return (
        <div className={`${props.className}`}>
            <Canvas
                text={props.data}
                options={{
                    errorCorrectionLevel: 'M',
                    margin: 3,
                    scale: 4,
                    width: 250,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                }}
            />
        </div>
    )

}

export default QrCode
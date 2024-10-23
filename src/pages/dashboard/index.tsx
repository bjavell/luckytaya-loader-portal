import DashboardLayout from "../layout"

const Home = () => {

    return (
        <DashboardLayout title="Dashboard" slug={'MAIN DASHBOARD'}>
            <div className="flex flex-col gap-4">

                <div className="text-bold text-2xl text-lightGreen">GOOD DAY, <br />E-BILLIARD AGENTS</div>
                <div className="font-light">Recently archived reports are now available and can be viewed by visiting the "Report Archive Menu" <br />Please bear in mind that the platform only offers a "Read Only" access in which you should not <br />perform your typical transactions on the said site. Thank you for your continuous support.
                </div>
                <div>E-Billiard Account Services</div>
            </div>
        </DashboardLayout>

    )
}

export default Home
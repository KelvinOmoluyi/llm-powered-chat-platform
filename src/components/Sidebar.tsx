import { FaXmark } from 'react-icons/fa6';
import { BiEdit } from 'react-icons/bi';
import { BiSolidReceipt } from 'react-icons/bi';
import Thread from './Thread';

const Sidebar = () => {
    const threads = [
        {
            id: 1,
            day: "Today",
            text: "Tell us about your capabilities"
        },
        {
            id: 2,
            day: "Yesterday",
            text: "Tell us about your capabilities"
        },
        {
            id: 3,
            day: "3 days ago",
            text: "Tell us about your capabilities"
        },
        {
            id: 4,
            day: "7 days ago",
            text: "Tell us about your capabilities"
        },
        {
            id: 5,
            day: "Last 30 days ago",
            text: "Tell us about your capabilities"
        },
    ]


    return (
        <div className="h-full w-full p-6">
            <div className='flex justify-between'>
                <div className='flex gap-5'>
                    <BiEdit color='#f8e709' className='size-6' />
                    <BiSolidReceipt color='#acacac' className='size-6' />
                </div>
                <div>
                    <FaXmark color='#acacac' className='size-6' />
                </div>
            </div>
            
            <div className='w-full h-full mt-9 flex flex-col gap-4'>
                {threads.map(thread => (
                    <Thread key={thread.id} day={thread.day} text={thread.text} />
                ))}
            </div>
        </div>
    );
}
 
export default Sidebar;
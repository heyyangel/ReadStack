import Slider from 'react-slick';
import BookCard from './BookCard';

const BookCarousel = ({ title, books }) => {
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1.5,
                },
            },
        ],
    };

    if (!books || books.length === 0) return null;

    return (
        <div className="my-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 px-2">{title}</h2>
            <Slider {...settings} className="-mx-2">
                {books.map((book) => (
                    <div key={book.id} className="px-2">
                        {/* Slider inserts standard divs, but we need to ensure spacing. 
                             BookCard has mx-2. Let's adjust.
                             Actually, BookCard has mx-2. If used in Grid, mx-2 might be annoying.
                             Let's check BookCard.jsx in previous step. 
                             It has mx-2. 
                             I should probably remove mx-2 from BookCard and let the container handle padding/gap.
                         */}
                        <BookCard book={book} />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default BookCarousel;

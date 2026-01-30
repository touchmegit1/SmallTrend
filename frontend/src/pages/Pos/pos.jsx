import "bootstrap/dist/css/bootstrap.min.css";
import ProductCard from "./Card";

function Incre() {
  return (
    <div className="p-3">
      <ProductCard
        ten="Bánh mì tươi"
        barcode="Bánh mì & Ngũ cốc"
        gia="15.000"
      />
    </div>
  );
}

export default Incre;

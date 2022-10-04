
/*

  assets.js


*/
const SCALE = 1. / 768
function scalepos( Pv ){
	for(let i=0;i<Pv.length;++i)
		for(let j=0;j<3;++j)
			Pv[i][j] *= SCALE
}

scalepos(Shadow.Pv);
scalepos(Dude.Pv);
//scalepos(Seal.Pv);
scalepos(Terrain.Pv);


// A hidden page for the owner and for checks: every piece of the art library, drawn by the app itself.
// Open /gallery in the web version. Nothing in the app links here.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { appIcon, stamp } from '@/art/brand';
import { illustration, illustrationNames } from '@/art/illustrations';
import { lessonTile } from '@/art/lessonIcons';
import { levelObject, object, objectNames, puck } from '@/art/objects';
import { uiIcon, uiIconBodies, type UiIconName } from '@/art/uiIcons';
import { course } from '@/content/course';
import { courseBlue, font, levelPalette, palette, reward, soonGrey } from '@/theme/tokens';
import { Art } from '@/ui/Art';

const levelOfObject = (name: string) => Object.keys(levelObject).find((id) => levelObject[id] === name);

export default function Gallery() {
  return (
    <ScrollView style={{ backgroundColor: palette.page }} contentContainerStyle={st.page}>
      <Text style={st.h}>App icon</Text>
      <View style={st.row}>
        {(['ink', 'blue', 'white'] as const).map((v) => (
          <View key={v} style={st.icon}>
            <Art xml={appIcon(courseBlue, v, { scale: 7 })} width={96} />
          </View>
        ))}
      </View>

      {course.levels.map((lv) => (
        <View key={lv.id}>
          <Text style={st.h}>{lv.title}</Text>
          <View style={st.row}>
            <Art xml={puck(levelPalette[lv.id], 'done')} width={72} />
            {lv.lessons.map((x) => (
              <Art key={x.id} xml={lessonTile(x.id, lv.id, levelPalette[lv.id])} width={52} />
            ))}
          </View>
        </View>
      ))}

      <Text style={st.h}>Objects</Text>
      <View style={st.row}>
        {objectNames.map((n) => {
          const lv = levelOfObject(n);
          return <Art key={n} xml={object(n, n === 'lock' ? soonGrey : lv ? levelPalette[lv] : courseBlue, reward)} width={104} />;
        })}
      </View>

      <Text style={st.h}>Stamps</Text>
      <View style={st.row}>
        {(['independent', 'assisted', 'revealed', 'level'] as const).map((s) => (
          <Art key={s} xml={stamp(s, courseBlue, reward, soonGrey)} width={72} />
        ))}
      </View>

      <Text style={st.h}>Illustrations</Text>
      <View style={st.row}>
        {illustrationNames.map((n) => (
          <Art key={n} xml={illustration(n, courseBlue, reward)} width={300} />
        ))}
      </View>

      <Text style={st.h}>Interface icons</Text>
      <View style={st.row}>
        {(Object.keys(uiIconBodies) as UiIconName[]).map((n) => (
          <Art key={n} xml={uiIcon(n)} width={28} color={palette.ink} />
        ))}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  page: { padding: 20, paddingBottom: 60, gap: 4 },
  h: { fontFamily: font.display, fontSize: 18, color: palette.ink, marginTop: 22, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  icon: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: palette.line },
});

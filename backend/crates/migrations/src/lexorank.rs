//! Port of `lexorank` 1.0.5 (`0|hzzzzz:` ranks). Used by the historical
//! rerank migration and by new posts that need a default rank.

const DIGITS: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";
const BASE: i32 = 36;

#[derive(Clone, Debug, PartialEq, Eq)]
struct Integer {
    sign: i32,
    mag: Vec<i32>,
}

impl Integer {
    fn zero() -> Self {
        Self {
            sign: 0,
            mag: vec![0],
        }
    }

    fn one() -> Self {
        Self {
            sign: 1,
            mag: vec![1],
        }
    }

    fn parse(input: &str) -> Self {
        let (sign, body) = if let Some(rest) = input.strip_prefix('+') {
            (1, rest)
        } else if let Some(rest) = input.strip_prefix('-') {
            (-1, rest)
        } else {
            (1, input)
        };
        let mut mag = vec![0; body.len()];
        for (index, ch) in body.chars().rev().enumerate() {
            mag[index] = digit(ch);
        }
        Self::make(sign, mag)
    }

    fn make(sign: i32, mag: Vec<i32>) -> Self {
        let mut actual = mag.len();
        while actual > 0 && mag[actual - 1] == 0 {
            actual -= 1;
        }
        if actual == 0 {
            return Self::zero();
        }
        Self {
            sign,
            mag: mag[..actual].to_vec(),
        }
    }

    fn is_zero(&self) -> bool {
        self.sign == 0 && self.mag.len() == 1 && self.mag[0] == 0
    }

    fn is_oneish(&self) -> bool {
        self.mag.len() == 1 && self.mag[0] == 1
    }

    fn get(&self, index: usize) -> i32 {
        self.mag[index]
    }

    fn add(&self, other: &Self) -> Self {
        if self.is_zero() {
            return other.clone();
        }
        if other.is_zero() {
            return self.clone();
        }
        if self.sign != other.sign {
            return if self.sign == -1 {
                self.negate().subtract(other).negate()
            } else {
                self.subtract(&other.negate())
            };
        }
        Self::make(self.sign, add_mag(&self.mag, &other.mag))
    }

    fn subtract(&self, other: &Self) -> Self {
        if self.is_zero() {
            return other.negate();
        }
        if other.is_zero() {
            return self.clone();
        }
        if self.sign != other.sign {
            return if self.sign == -1 {
                self.negate().add(other).negate()
            } else {
                self.add(&other.negate())
            };
        }
        let cmp = cmp_mag(&self.mag, &other.mag);
        if cmp == 0 {
            return Self::zero();
        }
        if cmp < 0 {
            let sign = if self.sign == -1 { 1 } else { -1 };
            Self::make(sign, sub_mag(&other.mag, &self.mag))
        } else {
            Self::make(self.sign, sub_mag(&self.mag, &other.mag))
        }
    }

    fn multiply(&self, other: &Self) -> Self {
        if self.is_zero() {
            return self.clone();
        }
        if other.is_zero() {
            return other.clone();
        }
        if self.is_oneish() {
            let sign = if self.sign == other.sign { 1 } else { -1 };
            return Self::make(sign, other.mag.clone());
        }
        if other.is_oneish() {
            let sign = if self.sign == other.sign { 1 } else { -1 };
            return Self::make(sign, self.mag.clone());
        }
        let sign = if self.sign == other.sign { 1 } else { -1 };
        Self::make(sign, mul_mag(&self.mag, &other.mag))
    }

    fn negate(&self) -> Self {
        if self.is_zero() {
            self.clone()
        } else {
            Self::make(if self.sign == 1 { -1 } else { 1 }, self.mag.clone())
        }
    }

    fn shift_left(&self, times: usize) -> Self {
        if times == 0 {
            return self.clone();
        }
        let mut mag = vec![0; self.mag.len() + times];
        mag[times..].copy_from_slice(&self.mag);
        Self::make(self.sign, mag)
    }

    fn shift_right(&self, times: usize) -> Self {
        if self.mag.len() <= times {
            return Self::zero();
        }
        Self::make(self.sign, self.mag[times..].to_vec())
    }

    fn compare(&self, other: &Self) -> i32 {
        if self.sign == -1 {
            if other.sign == -1 {
                let cmp = cmp_mag(&self.mag, &other.mag);
                return if cmp == -1 {
                    1
                } else if cmp == 1 {
                    -1
                } else {
                    0
                };
            }
            return -1;
        }
        if self.sign == 1 {
            return if other.sign == 1 {
                cmp_mag(&self.mag, &other.mag)
            } else {
                1
            };
        }
        if other.sign == -1 {
            1
        } else if other.sign == 1 {
            -1
        } else {
            0
        }
    }

    fn format(&self) -> String {
        if self.is_zero() {
            return "0".to_owned();
        }
        let mut chars = String::new();
        for digit in self.mag.iter().rev() {
            chars.push(char_of(*digit));
        }
        if self.sign == -1 {
            format!("-{chars}")
        } else {
            chars
        }
    }
}

fn digit(ch: char) -> i32 {
    match ch {
        '0'..='9' => ch as i32 - '0' as i32,
        'a'..='z' => ch as i32 - 'a' as i32 + 10,
        _ => 0,
    }
}

fn char_of(digit: i32) -> char {
    DIGITS[digit as usize] as char
}

fn add_mag(left: &[i32], right: &[i32]) -> Vec<i32> {
    let size = left.len().max(right.len());
    let mut result = Vec::with_capacity(size);
    let mut carry = 0;
    for i in 0..size {
        let sum = left.get(i).copied().unwrap_or(0) + right.get(i).copied().unwrap_or(0) + carry;
        carry = sum / BASE;
        result.push(sum % BASE);
    }
    if carry > 0 {
        result.push(carry);
    }
    result
}

fn sub_mag(left: &[i32], right: &[i32]) -> Vec<i32> {
    let complement = complement(right, left.len());
    let mut sum = add_mag(left, &complement);
    let last = sum.len() - 1;
    sum[last] = 0;
    add_mag(&sum, &[1])
}

fn mul_mag(left: &[i32], right: &[i32]) -> Vec<i32> {
    let mut result = vec![0; left.len() + right.len()];
    for (li, ldigit) in left.iter().enumerate() {
        for (ri, rdigit) in right.iter().enumerate() {
            let index = li + ri;
            result[index] += ldigit * rdigit;
            while result[index] >= BASE {
                result[index] -= BASE;
                result[index + 1] += 1;
            }
        }
    }
    result
}

fn complement(mag: &[i32], digits: usize) -> Vec<i32> {
    let mut out = vec![BASE - 1; digits];
    for (i, value) in mag.iter().enumerate() {
        out[i] = BASE - 1 - value;
    }
    out
}

fn cmp_mag(left: &[i32], right: &[i32]) -> i32 {
    if left.len() < right.len() {
        return -1;
    }
    if left.len() > right.len() {
        return 1;
    }
    for i in (0..left.len()).rev() {
        if left[i] < right[i] {
            return -1;
        }
        if left[i] > right[i] {
            return 1;
        }
    }
    0
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct Decimal {
    mag: Integer,
    sig: usize,
}

impl Decimal {
    fn make(integer: Integer, sig: usize) -> Self {
        if integer.is_zero() {
            return Self {
                mag: integer,
                sig: 0,
            };
        }
        let mut zero_count = 0;
        while zero_count < sig && integer.get(zero_count) == 0 {
            zero_count += 1;
        }
        Self {
            mag: integer.shift_right(zero_count),
            sig: sig - zero_count,
        }
    }

    fn parse(input: &str) -> Self {
        if let Some(index) = input.find(':') {
            let mut body = String::new();
            body.push_str(&input[..index]);
            body.push_str(&input[index + 1..]);
            let sig = input.len() - 1 - index;
            Self::make(Integer::parse(&body), sig)
        } else {
            Self::make(Integer::parse(input), 0)
        }
    }

    fn half() -> Self {
        Self::make(
            Integer {
                sign: 1,
                mag: vec![BASE / 2],
            },
            1,
        )
    }

    fn scale(&self) -> usize {
        self.sig
    }

    fn add(&self, other: &Self) -> Self {
        let mut left = self.mag.clone();
        let mut right = other.mag.clone();
        let mut lsig = self.sig;
        let mut rsig = other.sig;
        while lsig < rsig {
            left = left.shift_left(1);
            lsig += 1;
        }
        while lsig > rsig {
            right = right.shift_left(1);
            rsig += 1;
        }
        Self::make(left.add(&right), lsig)
    }

    fn subtract(&self, other: &Self) -> Self {
        let mut left = self.mag.clone();
        let mut right = other.mag.clone();
        let mut lsig = self.sig;
        let mut rsig = other.sig;
        while lsig < rsig {
            left = left.shift_left(1);
            lsig += 1;
        }
        while lsig > rsig {
            right = right.shift_left(1);
            rsig += 1;
        }
        Self::make(left.subtract(&right), lsig)
    }

    fn multiply(&self, other: &Self) -> Self {
        Self::make(self.mag.multiply(&other.mag), self.sig + other.sig)
    }

    fn floor(&self) -> Integer {
        self.mag.shift_right(self.sig)
    }

    fn is_exact(&self) -> bool {
        if self.sig == 0 {
            return true;
        }
        (0..self.sig).all(|i| self.mag.get(i) == 0)
    }

    fn ceil(&self) -> Integer {
        if self.is_exact() {
            self.mag.clone()
        } else {
            self.floor().add(&Integer::one())
        }
    }

    fn set_scale(&self, nsig: usize, ceiling: bool) -> Self {
        if nsig >= self.sig {
            return self.clone();
        }
        let diff = self.sig - nsig;
        let mut mag = self.mag.shift_right(diff);
        if ceiling {
            mag = mag.add(&Integer::one());
        }
        Self::make(mag, nsig)
    }

    fn compare(&self, other: &Self) -> i32 {
        let (left, right) = if self.sig > other.sig {
            (self.mag.clone(), other.mag.shift_left(self.sig - other.sig))
        } else if self.sig < other.sig {
            (self.mag.shift_left(other.sig - self.sig), other.mag.clone())
        } else {
            (self.mag.clone(), other.mag.clone())
        };
        left.compare(&right)
    }

    fn format(&self) -> String {
        let int_str = self.mag.format();
        if self.sig == 0 {
            return int_str;
        }
        let mut chars: Vec<char> = int_str.chars().collect();
        let head = chars[0];
        let special = head == '+' || head == '-';
        if special {
            chars.remove(0);
        }
        while chars.len() < self.sig + 1 {
            chars.insert(0, '0');
        }
        chars.insert(chars.len() - self.sig, ':');
        if chars.len() - self.sig == 0 {
            chars.insert(0, '0');
        }
        if special {
            chars.insert(0, head);
        }
        chars.into_iter().collect()
    }
}

fn format_decimal(decimal: &Decimal) -> String {
    let format_val = decimal.format();
    let mut chars: Vec<char> = format_val.chars().collect();
    let mut partial = format_val.find(':').unwrap_or(format_val.len());
    if !format_val.contains(':') {
        chars.push(':');
    }
    while partial < 6 {
        chars.insert(0, '0');
        partial += 1;
    }
    while chars.last() == Some(&'0') {
        chars.pop();
    }
    chars.into_iter().collect()
}

fn between_decimal(left: &Decimal, right: &Decimal) -> Decimal {
    let mut left_scaled = left.clone();
    let mut right_scaled = right.clone();
    if left.scale() < right.scale() {
        let nleft = right.set_scale(left.scale(), false);
        if left.compare(&nleft) >= 0 {
            return mid(left, right);
        }
        right_scaled = nleft;
    }
    if left.scale() > right_scaled.scale() {
        let nleft = left.set_scale(right_scaled.scale(), true);
        if nleft.compare(&right_scaled) >= 0 {
            return mid(left, right);
        }
        left_scaled = nleft;
    }
    let mut scale = left_scaled.scale();
    while scale > 0 {
        let nscale = scale - 1;
        let nleft = left_scaled.set_scale(nscale, true);
        let nright = right_scaled.set_scale(nscale, false);
        let cmp = nleft.compare(&nright);
        if cmp == 0 {
            return check_mid(left, right, &nleft);
        }
        if nleft.compare(&nright) > 0 {
            break;
        }
        scale = nscale;
        left_scaled = nleft;
        right_scaled = nright;
    }
    let mut mid_value = check_mid(left, right, &mid(&left_scaled, &right_scaled));
    let mut mscale = mid_value.scale();
    while mscale > 0 {
        let nscale = mscale - 1;
        let nmid = mid_value.set_scale(nscale, false);
        if left.compare(&nmid) >= 0 || nmid.compare(right) >= 0 {
            break;
        }
        mid_value = nmid;
        mscale = nscale;
    }
    mid_value
}

fn check_mid(left: &Decimal, right: &Decimal, mid_value: &Decimal) -> Decimal {
    if left.compare(mid_value) >= 0 || mid_value.compare(right) >= 0 {
        mid(left, right)
    } else {
        mid_value.clone()
    }
}

fn mid(left: &Decimal, right: &Decimal) -> Decimal {
    let sum = left.add(right);
    let mid_value = sum.multiply(&Decimal::half());
    let scale = left.scale().max(right.scale());
    if mid_value.scale() > scale {
        let round_down = mid_value.set_scale(scale, false);
        if round_down.compare(left) > 0 {
            return round_down;
        }
        let round_up = mid_value.set_scale(scale, true);
        if round_up.compare(right) < 0 {
            return round_up;
        }
    }
    mid_value
}

fn min_decimal() -> Decimal {
    Decimal::parse("0")
}

fn max_decimal() -> Decimal {
    Decimal::parse("1000000").subtract(&Decimal::parse("1"))
}

fn eight() -> Decimal {
    Decimal::parse("8")
}

fn initial_min() -> Decimal {
    Decimal::parse("100000")
}

/// A LexoRank value such as `0|hzzzzz:`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Rank {
    decimal: Decimal,
}

impl Rank {
    /// The rank `LexoRank.middle()` returns.
    #[must_use]
    pub fn middle() -> Self {
        let min = Self {
            decimal: min_decimal(),
        };
        let max = Self {
            decimal: max_decimal(),
        };
        Self {
            decimal: between_decimal(&min.decimal, &max.decimal),
        }
    }

    /// Parse a stored rank. The bucket is kept only as the leading `0|`.
    ///
    /// # Errors
    /// Returns an error when the value has no `|` separator.
    pub fn parse(value: &str) -> Result<Self, String> {
        let (_, decimal) = value
            .split_once('|')
            .ok_or_else(|| format!("invalid rank {value}"))?;
        Ok(Self {
            decimal: Decimal::parse(decimal),
        })
    }

    /// Next rank, matching `genNext`.
    #[must_use]
    pub fn gen_next(&self) -> Self {
        if self.decimal.compare(&min_decimal()) == 0 {
            return Self {
                decimal: initial_min(),
            };
        }
        let ceil = Decimal::make(self.decimal.ceil(), 0);
        let mut next = ceil.add(&eight());
        if next.compare(&max_decimal()) >= 0 {
            next = between_decimal(&self.decimal, &max_decimal());
        }
        Self { decimal: next }
    }

    /// Rank strictly between `self` and `other`.
    ///
    /// # Errors
    /// Returns an error when the two ranks are equal.
    pub fn between(&self, other: &Self) -> Result<Self, String> {
        let cmp = self.decimal.compare(&other.decimal);
        if cmp == 0 {
            return Err("equal ranks".to_owned());
        }
        let decimal = if cmp > 0 {
            between_decimal(&other.decimal, &self.decimal)
        } else {
            between_decimal(&self.decimal, &other.decimal)
        };
        Ok(Self { decimal })
    }
}

impl std::fmt::Display for Rank {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "0|{}", format_decimal(&self.decimal))
    }
}

#[cfg(test)]
mod tests {
    use super::Rank;

    #[test]
    fn matches_lexorank_1_0_5_sequence() {
        let expected = [
            "0|hzzzzz:",
            "0|i00007:",
            "0|i0000f:",
            "0|i0000n:",
            "0|i0000v:",
            "0|i00013:",
            "0|i0001b:",
            "0|i0001j:",
            "0|i0001r:",
        ];
        let mut rank = Rank::middle();
        assert_eq!(rank.to_string(), expected[0]);
        for value in &expected[1..] {
            rank = rank.gen_next();
            assert_eq!(rank.to_string(), *value);
        }
        let left = Rank::parse(expected[2]).expect("rank");
        let right = Rank::parse(expected[5]).expect("rank");
        assert_eq!(
            left.between(&right).expect("between").to_string(),
            "0|i0000r:"
        );
    }
}
